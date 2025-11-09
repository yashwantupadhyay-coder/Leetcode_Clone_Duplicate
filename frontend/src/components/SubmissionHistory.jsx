import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        console.log("📦 API Response:", response.data);

        // ✅ Handle both possible response formats safely
        if (Array.isArray(response.data)) {
          setSubmissions(response.data);
        } else if (response.data.submissions && Array.isArray(response.data.submissions)) {
          setSubmissions(response.data.submissions);
        } else {
          setSubmissions([]);
        }

      } catch (err) {
        console.error("❌ Error fetching submissions:", err);
        setError('Failed to fetch submission history');
      } finally {
        setLoading(false);
      }
    };

    if (problemId) fetchSubmissions();
  }, [problemId]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'badge-success';
      case 'wrong': return 'badge-error';
      case 'error': return 'badge-warning';
      case 'pending': return 'badge-info';
      default: return 'badge-neutral';
    }
  };

  const formatMemory = (memory) => {
    if (!memory) return '-';
    return memory < 1024 ? `${memory} KB` : `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  // ⏳ Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // ⚠️ Error State
  if (error) {
    return (
      <div className="alert alert-error shadow-lg my-4">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // 📋 Main Table
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Submission History</h2>

      {submissions.length === 0 ? (
        <div className="alert alert-info shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>No submissions found for this problem.</span>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Language</th>
                  <th>Status</th>
                  <th>Runtime</th>
                  <th>Memory</th>
                  <th>Test Cases</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, index) => (
                  <tr key={sub._id || index}>
                    <td>{index + 1}</td>
                    <td className="font-mono">{sub.language || "-"}</td>
                    <td>
                      <span className={`badge ${getStatusColor(sub.status)}`}>
                        {sub.status ? sub.status.charAt(0).toUpperCase() + sub.status.slice(1) : "Unknown"}
                      </span>
                    </td>
                    <td className="font-mono">{sub.runtime ? `${sub.runtime}s` : "-"}</td>
                    <td className="font-mono">{formatMemory(sub.memory)}</td>
                    <td className="font-mono">
                      {sub.testCasesPassed ?? 0}/{sub.testCasesTotal ?? 0}
                    </td>
                    <td>{formatDate(sub.createdAt)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => setSelectedSubmission(sub)}
                      >
                        Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Showing {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
          </p>
        </>
      )}

      {/* 💬 Code View Modal */}
      {selectedSubmission && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-5xl">
            <h3 className="font-bold text-lg mb-4">
              Submission Details ({selectedSubmission.language})
            </h3>

            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`badge ${getStatusColor(selectedSubmission.status)}`}>
                  {selectedSubmission.status}
                </span>
                <span className="badge badge-outline">
                  Runtime: {selectedSubmission.runtime || 0}s
                </span>
                <span className="badge badge-outline">
                  Memory: {formatMemory(selectedSubmission.memory)}
                </span>
                <span className="badge badge-outline">
                  Passed: {selectedSubmission.testCasesPassed ?? 0}/{selectedSubmission.testCasesTotal ?? 0}
                </span>
              </div>

              {selectedSubmission.errorMessage && (
                <div className="alert alert-error mt-2">
                  <div>
                    <span>{selectedSubmission.errorMessage}</span>
                  </div>
                </div>
              )}
            </div>

            <pre className="p-4 bg-gray-900 text-gray-100 rounded overflow-x-auto text-sm">
              <code>{selectedSubmission.code || "No code available"}</code>
            </pre>

            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setSelectedSubmission(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;


// import { useState, useEffect } from 'react';
// import axiosClient from '../utils/axiosClient';

// const SubmissionHistory = ({ problemId }) => {
//   const [submissions, setSubmissions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedSubmission, setSelectedSubmission] = useState(null);

//   useEffect(() => {
//     const fetchSubmissions = async () => {
//       try {
//         setLoading(true);
//         const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
//         console.log("🧾 Backend response:", response.data);
//         // ✅ Fix: ensure submissions is always an array
//         setSubmissions(response.data.submissions || []);
//         setError(null);
//       } catch (err) {
//         setError('Failed to fetch submission history');
//         console.error("❌ Error fetching submissions:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSubmissions();
//   }, [problemId]);

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'accepted': return 'badge-success';
//       case 'wrong': return 'badge-error';
//       case 'error': return 'badge-warning';
//       case 'pending': return 'badge-info';
//       default: return 'badge-neutral';
//     }
//   };

//   const formatMemory = (memory) => {
//     if (memory < 1024) return `${memory} kB`;
//     return `${(memory / 1024).toFixed(2)} MB`;
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleString();
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <span className="loading loading-spinner loading-lg"></span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="alert alert-error shadow-lg my-4">
//         <div>
//           <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//           <span>{error}</span>
//         </div>
//       </div>
//     );
//   }

//   // ✅ Extra Safe Check
//   if (!Array.isArray(submissions)) {
//     return (
//       <div className="alert alert-warning shadow-lg my-4">
//         <div>
//           <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 20.75a8.75 8.75 0 100-17.5 8.75 8.75 0 000 17.5z" />
//           </svg>
//           <span>⚠️ Invalid data received from the server.</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <h2 className="text-2xl font-bold mb-6 text-center">Submission History</h2>
      
//       {submissions.length === 0 ? (
//         <div className="alert alert-info shadow-lg">
//           <div>
//             <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//             </svg>
//             <span>No submissions found for this problem</span>
//           </div>
//         </div>
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//             <table className="table table-zebra w-full">
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>Language</th>
//                   <th>Status</th>
//                   <th>Runtime</th>
//                   <th>Memory</th>
//                   <th>Test Cases</th>
//                   <th>Submitted</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {submissions.map((sub, index) => (
//                   <tr key={sub._id || index}>
//                     <td>{index + 1}</td>
//                     <td className="font-mono">{sub.language || "N/A"}</td>
//                     <td>
//                       <span className={`badge ${getStatusColor(sub.status)}`}>
//                         {sub.status ? sub.status.charAt(0).toUpperCase() + sub.status.slice(1) : "Unknown"}
//                       </span>
//                     </td>
//                     <td className="font-mono">{sub.runtime || "—"} sec</td>
//                     <td className="font-mono">{formatMemory(sub.memory || 0)}</td>
//                     <td className="font-mono">{sub.testCasesPassed || 0}/{sub.testCasesTotal || 0}</td>
//                     <td>{formatDate(sub.createdAt)}</td>
//                     <td>
//                       <button 
//                         className="btn btn-sm btn-outline"
//                         onClick={() => setSelectedSubmission(sub)}
//                       >
//                         Code
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <p className="mt-4 text-sm text-gray-500 text-center">
//             Showing {submissions.length} submissions
//           </p>
//         </>
//       )}

//       {/* ✅ Code View Modal */}
//       {selectedSubmission && (
//         <div className="modal modal-open">
//           <div className="modal-box w-11/12 max-w-5xl">
//             <h3 className="font-bold text-lg mb-4">
//               Submission Details: {selectedSubmission.language}
//             </h3>
            
//             <div className="mb-4">
//               <div className="flex flex-wrap gap-2 mb-2">
//                 <span className={`badge ${getStatusColor(selectedSubmission.status)}`}>
//                   {selectedSubmission.status}
//                 </span>
//                 <span className="badge badge-outline">
//                   Runtime: {selectedSubmission.runtime}s
//                 </span>
//                 <span className="badge badge-outline">
//                   Memory: {formatMemory(selectedSubmission.memory)}
//                 </span>
//                 <span className="badge badge-outline">
//                   Passed: {selectedSubmission.testCasesPassed}/{selectedSubmission.testCasesTotal}
//                 </span>
//               </div>
              
//               {selectedSubmission.errorMessage && (
//                 <div className="alert alert-error mt-2">
//                   <div>
//                     <span>{selectedSubmission.errorMessage}</span>
//                   </div>
//                 </div>
//               )}
//             </div>
            
//             <pre className="p-4 bg-gray-900 text-gray-100 rounded overflow-x-auto">
//               <code>{selectedSubmission.code}</code>
//             </pre>
            
//             <div className="modal-action">
//               <button 
//                 className="btn"
//                 onClick={() => setSelectedSubmission(null)}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SubmissionHistory;


