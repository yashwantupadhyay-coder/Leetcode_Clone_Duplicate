const { getLanguageById, submitBatch, submitToken } = require("../utils/problemUtility");
const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submission");
const SolutionVideo = require("../models/solutionVideo");


// 🧩 Create a new problem
const createProblem = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      tags,
      visibleTestCases,
      hiddenTestCases,
      startCode,
      referenceSolution,
    } = req.body;

    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageById(language);

      const submissions = visibleTestCases.map((testcase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      }));

      const submitResult = await submitBatch(submissions);
      const resultToken = submitResult.map((value) => value.token);
      const testResult = await submitToken(resultToken);

      for (const test of testResult) {
        if (test.status_id !== 3) {
          return res.status(400).json({ message: "Error occurred while validating test cases" });
        }
      }
    }

    const userProblem = await Problem.create({
      ...req.body,
      problemCreator: req.result._id,
    });

    return res.status(201).json({ message: "Problem saved successfully", problem: userProblem });
  } catch (err) {
    console.error("Error in createProblem:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};


// 🧩 Update an existing problem
const updateProblem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Missing ID field" });

    const problem = await Problem.findById(id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    const { visibleTestCases, referenceSolution } = req.body;

    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageById(language);

      const submissions = visibleTestCases.map((testcase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      }));

      const submitResult = await submitBatch(submissions);
      const resultToken = submitResult.map((value) => value.token);
      const testResult = await submitToken(resultToken);

      for (const test of testResult) {
        if (test.status_id !== 3) {
          return res.status(400).json({ message: "Error occurred while validating test cases" });
        }
      }
    }

    const updatedProblem = await Problem.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    return res.status(200).json({ message: "Problem updated successfully", problem: updatedProblem });
  } catch (err) {
    console.error("Error in updateProblem:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};


// 🧩 Delete a problem
const deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID is missing" });

    const deletedProblem = await Problem.findByIdAndDelete(id);
    if (!deletedProblem) return res.status(404).json({ message: "Problem not found" });

    return res.status(200).json({ message: "Problem deleted successfully" });
  } catch (err) {
    console.error("Error in deleteProblem:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};


// 🧩 Get problem by ID
const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID is missing" });

    const problem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution');
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    const videos = await SolutionVideo.findOne({ problemId: id });
    const responseData = videos
      ? {
          ...problem.toObject(),
          secureUrl: videos.secureUrl,
          thumbnailUrl: videos.thumbnailUrl,
          duration: videos.duration,
        }
      : problem;

    return res.status(200).json(responseData);
  } catch (err) {
    console.error("Error in getProblemById:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};


// 🧩 Get all problems
const getAllProblem = async (req, res) => {
  try {
    const problems = await Problem.find({}).select('_id title difficulty tags');
    if (problems.length === 0) return res.status(404).json({ message: "No problems found" });

    return res.status(200).json(problems);
  } catch (err) {
    console.error("Error in getAllProblem:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};


// 🧩 Get all solved problems by a user
const solvedAllProblembyUser = async (req, res) => {
  try {
    const userId = req.result._id;
    const user = await User.findById(userId).populate({
      path: "problemSolved",
      select: "_id title difficulty tags",
    });

    return res.status(200).json(user.problemSolved);
  } catch (err) {
    console.error("Error in solvedAllProblembyUser:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// 🧩 Get submitted problems by user
const submittedProblem = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.pid;

    const submissions = await Submission.find({ userId, problemId });

    if (submissions.length === 0) {
      return res.status(200).json({
        message: "No submissions found for this problem",
        submissions: [],
      });
    }

    return res.status(200).json({
      message: "Submissions fetched successfully",
      submissions,
    });
  } catch (err) {
    console.error("Error in submittedProblem:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};


// 🧩 Exports
module.exports = {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblem,
  solvedAllProblembyUser,
  submittedProblem,
};


// const {getLanguageById,submitBatch,submitToken} = require("../utils/problemUtility");
// const Problem = require("../models/problem");
// const User = require("../models/user");
// const Submission = require("../models/submission");
// const SolutionVideo = require("../models/solutionVideo")

// const createProblem = async (req,res)=>{
   
//   // API request to authenticate user:
//     const {title,description,difficulty,tags,
//         visibleTestCases,hiddenTestCases,startCode,
//         referenceSolution, problemCreator
//     } = req.body;


//     try{
       
//       for(const {language,completeCode} of referenceSolution){
         

//         // source_code:
//         // language_id:
//         // stdin: 
//         // expectedOutput:

//         const languageId = getLanguageById(language);
          
//         // I am creating Batch submission
//         const submissions = visibleTestCases.map((testcase)=>({
//             source_code:completeCode,
//             language_id: languageId,
//             stdin: testcase.input,
//             expected_output: testcase.output
//         }));


//         const submitResult = await submitBatch(submissions);
//         // console.log(submitResult);

//         const resultToken = submitResult.map((value)=> value.token);

//         // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]
        
//        const testResult = await submitToken(resultToken);


//        console.log(testResult);

//        for(const test of testResult){
//         if(test.status_id!=3){
//          return res.status(400).send("Error Occured");
//         }
//        }

//       }


//       // We can store it in our DB

//     const userProblem =  await Problem.create({
//         ...req.body,
//         problemCreator: req.result._id
//       });

//       res.status(201).send("Problem Saved Successfully");
//     }
//     catch(err){
//         res.status(400).send("Error: "+err);
//     }
// }

// const updateProblem = async (req,res)=>{
    
//   const {id} = req.params;
//   const {title,description,difficulty,tags,
//     visibleTestCases,hiddenTestCases,startCode,
//     referenceSolution, problemCreator
//    } = req.body;

//   try{

//      if(!id){
//       return res.status(400).send("Missing ID Field");
//      }

//     const DsaProblem =  await Problem.findById(id);
//     if(!DsaProblem)
//     {
//       return res.status(404).send("ID is not persent in server");
//     }
      
//     for(const {language,completeCode} of referenceSolution){
         

//       // source_code:
//       // language_id:
//       // stdin: 
//       // expectedOutput:

//       const languageId = getLanguageById(language);
        
//       // I am creating Batch submission
//       const submissions = visibleTestCases.map((testcase)=>({
//           source_code:completeCode,
//           language_id: languageId,
//           stdin: testcase.input,
//           expected_output: testcase.output
//       }));


//       const submitResult = await submitBatch(submissions);
//       // console.log(submitResult);

//       const resultToken = submitResult.map((value)=> value.token);

//       // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]
      
//      const testResult = await submitToken(resultToken);

//     //  console.log(testResult);

//      for(const test of testResult){
//       if(test.status_id!=3){
//        return res.status(400).send("Error Occured");
//       }
//      }

//     }


//   const newProblem = await Problem.findByIdAndUpdate(id , {...req.body}, {runValidators:true, new:true});
   
//   res.status(200).send(newProblem);
//   }
//   catch(err){
//       res.status(500).send("Error: "+err);
//   }
// }

// const deleteProblem = async(req,res)=>{

//   const {id} = req.params;
//   try{
     
//     if(!id)
//       return res.status(400).send("ID is Missing");

//    const deletedProblem = await Problem.findByIdAndDelete(id);

//    if(!deletedProblem)
//     return res.status(404).send("Problem is Missing");


//    res.status(200).send("Successfully Deleted");
//   }
//   catch(err){
     
//     res.status(500).send("Error: "+err);
//   }
// }


// const getProblemById = async(req,res)=>{

//   const {id} = req.params;
//   try{
     
//     if(!id)
//       return res.status(400).send("ID is Missing");

//     const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution ');
   
//     // video ka jo bhi url wagera le aao

//    if(!getProblem)
//     return res.status(404).send("Problem is Missing");

//    const videos = await SolutionVideo.findOne({problemId:id});

//    if(videos){   
    
//    const responseData = {
//     ...getProblem.toObject(),
//     secureUrl:videos.secureUrl,
//     thumbnailUrl : videos.thumbnailUrl,
//     duration : videos.duration,
//    } 
  
//    return res.status(200).send(responseData);
//    }
    
//    res.status(200).send(getProblem);

//   }
//   catch(err){
//     res.status(500).send("Error: "+err);
//   }
// }

// const getAllProblem = async(req,res)=>{

//   try{
     
//     const getProblem = await Problem.find({}).select('_id title difficulty tags');

//    if(getProblem.length==0)
//     return res.status(404).send("Problem is Missing");


//    res.status(200).send(getProblem);
//   }
//   catch(err){
//     res.status(500).send("Error: "+err);
//   }
// }


// const solvedAllProblembyUser =  async(req,res)=>{
   
//     try{
       
//       const userId = req.result._id;

//       const user =  await User.findById(userId).populate({
//         path:"problemSolved",
//         select:"_id title difficulty tags"
//       });
      
//       res.status(200).send(user.problemSolved);

//     }
//     catch(err){
//       res.status(500).send("Server Error");
//     }
// }

// const submittedProblem = async(req,res)=>{

//   try{
     
//     const userId = req.result._id;
//     const problemId = req.params.pid;

//    const ans = await Submission.find({userId,problemId});
  
//   if(ans.length==0)
//     res.status(200).send("No Submission is persent");

//   res.status(200).send(ans);

//   }
//   catch(err){
//      res.status(500).send("Internal Server Error");
//   }
// }



// module.exports = {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblembyUser,submittedProblem};


