// import React, { useEffect, useState, useRef } from "react";
// import {
//   Row,
//   Col,
//   Card,
//   CardBody,
//   CardTitle,
//   CardText,
//   Spinner,
// } from "reactstrap";
// import { useParams } from "react-router-dom";
// import {
//   getCompanyCode,
//   getDocumentsData,
// } from "../../../Unfluke_helpers/backend_helper";

// const Documents = ({ companyName }) => {
//   const params = useParams();
//   const [loading, setLoading] = useState(true);
//   const [companyCode, setCompanyCode] = useState(null);
//   const [ASCR, setASCR] = useState([]);
//   const [CreditRating, setCreditRating] = useState([]);
//   const [AnnualReport, setAnnualReport] = useState([]);
//   const [Announcements, setAnnouncements] = useState([]);
//   const [ConferenceCall, setConferenceCall] = useState([]);
//   const lastFetchedCompanyName = useRef(null);
//   const [ascrlink, setASCRlink] = useState(
//     "https://api.unfluke.in/api/historicdata/getascr"
//   );
//   const [annualReportlink, setAnnualReportlink] = useState(
//     "https://api.unfluke.in/api/historicdata/getannual"
//   );
//   function extractDisseminatedTime(text) {
//     const disseminatedTimeMatch = text.match(
//       /Exchange Disseminated Time (\d{2}-\d{2}-\d{4})/
//     );
//     return disseminatedTimeMatch ? disseminatedTimeMatch[1] : null;
//   }

//   useEffect(() => {
//     if (lastFetchedCompanyName.current === companyName) {
//       return;
//     }

//     async function getData() {
//       setLoading(true);
//       try {
//         const result = await getCompanyCode({
//           params: { instrument: params.company },
//         });

//         if (result?.code) {
//           // for (const item of result) {
//           // if (item.Co_Name === companyName) {
//           const response = await getDocumentsData({
//             params: { instrument: result.code },
//           });
//           if (response.ASCR) {
//             setASCR(response.ASCR);
//             setAnnualReport(response.AnnualReport);
//             setAnnouncements(response.Announcement);
//             setConferenceCall(response.ConferenceCalls);
//             setCreditRating(response.CreditRating);
//           }
//           setCompanyCode(result.code);
//           // break;
//           // }
//           // }
//         } else {
//           setASCR([]);
//           setAnnouncements([]);
//           setAnnualReport([]);
//           setConferenceCall([]);
//           setCreditRating([]);
//         }
//       } catch (error) {
//         console.error("Error fetching company code:", error);
//         setASCR([]);
//         setAnnouncements([]);
//         setAnnualReport([]);
//         setConferenceCall([]);
//         setCreditRating([]);
//       } finally {
//         setLoading(false);
//         lastFetchedCompanyName.current = companyName;
//       }
//     }
//     getData();
//   }, [companyName]);

//   const reports = [
//     { year: "Financial Year 2024", status: "Summary", available: true },
//     { year: "Financial Year 2023", status: "Available", available: true },
//     { year: "Financial Year 2022", status: "Available", available: true },
//     { year: "Financial Year 2021", status: "Available", available: true },
//     { year: "Financial Year 2020", status: "Available", available: true },
//     { year: "Financial Year 2019", status: "Available", available: true },
//     { year: "Financial Year 2018", status: "Available", available: true },
//     { year: "Financial Year 2017", status: "Available", available: true },
//     { year: "Financial Year 2016", status: "Available", available: true },
//     { year: "Financial Year 2015", status: "Available", available: true },
//     { year: "Financial Year 2014", status: "Available", available: true },
//     { year: "Financial Year 2013", status: "Available", available: true },
//   ];

//   const ratings = [
//     { agency: "CRISIL", rating: "AAA", date: "30 Oct 2024" },
//     { agency: "CRISIL", rating: "A1+", date: "19 Sep 2024" },
//     { agency: "CRISIL", rating: "AAA", date: "17 Jul 2024" },
//     { agency: "ICRA", rating: "AAA", date: "2 Feb 2024" },
//     { agency: "CRISIL", rating: "A1+", date: "19 Jan 2024" },
//     { agency: "CARE", rating: "AAA", date: "5 Jul 2024" },
//   ];

//   const calls = [
//     { title: "Investor Meet - Outcome", date: "Oct-24" },
//     { title: "Investor Meet - Outcome", date: "Aug-24" },
//     { title: "Investor Meet - Outcome", date: "Jul-24" },
//   ];

//   return (
//     <div className="mt-4">
//       {loading ? (
//         <div className="text-center my-4">
//           <Spinner color="primary" />
//         </div>
//       ) : (
//         <>

// <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

// <div className="bg-white dark:bg-gray-900 p-6 rounded-lg">
//       <div className="flex items-center space-x-2 mb-6">
//         <span className="text-blue-600 dark:text-blue-400">📄</span>
//         <h2 className="text-xl font-bold text-gray-900 dark:text-white">Annual Reports</h2>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//         {reports.map((report, index) => (
//           <a
//             key={index}
//             href="#"
//             className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
//           >
//             <h3 className="font-medium text-gray-900 dark:text-white mb-2">{report.year}</h3>
//             <span className={inline-block px-3 py-1 rounded text-sm font-medium ${
//               report.status === "Summary"
//                 ? "bg-gray-800 dark:bg-gray-700 text-white"
//                 : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
//             }}>
//               {report.status}
//             </span>
//           </a>
//         ))}
//       </div>
//     </div>

//     <div className="bg-white dark:bg-gray-900 p-6 rounded-lg">
//       <div className="flex items-center space-x-2 mb-6">
//         <span className="text-yellow-500">⭐</span>
//         <h2 className="text-xl font-bold text-gray-900 dark:text-white">Credit Ratings</h2>
//       </div>

//       <div className="space-y-4">
//         {ratings.map((rating, index) => (
//           <a
//             key={index}
//             href="#"
//             className="flex items-center justify-between py-3 px-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
//           >
//             <div className="flex items-center space-x-4">
//               <span className="font-medium text-gray-900 dark:text-white w-16">{rating.agency}</span>
//               <span className={px-3 py-1 rounded text-sm font-medium ${
//                 rating.rating === "AAA"
//                   ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
//                   : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
//               }}>
//                 {rating.rating}
//               </span>
//             </div>
//             <span className="text-gray-500 dark:text-gray-400 text-sm">{rating.date}</span>
//           </a>
//         ))}
//       </div>
//     </div>

// </div>

// <div className="mt-8">
// <div className="bg-white dark:bg-gray-900 p-6 rounded-lg">
//       <div className="flex items-center space-x-2 mb-6">
//         <span className="text-green-600 dark:text-green-400">📞</span>
//         <h2 className="text-xl font-bold text-gray-900 dark:text-white">Conference Calls</h2>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//         {calls.map((call, index) => (
//           <a
//             key={index}
//             href="#"
//             className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors duration-200 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer"
//           >
//             <h3 className="font-medium text-gray-900 dark:text-white mb-2">{call.title}</h3>
//             <div className="flex items-center space-x-2">
//               <span className="text-gray-500 dark:text-gray-400 text-sm">{call.date}</span>
//               <span className="text-gray-400 dark:text-gray-500">📅</span>
//             </div>
//           </a>
//         ))}
//       </div>
//     </div>
// </div>

//           <Row>
//             <Col md="12" className="mb-4">
//               <Card style={{ backgroundColor:"var(--vz-body-bg)"}}>
//                 <CardBody>
//                   <CardTitle tag="h4" className="mb-3">
//                     Annual Reports
//                   </CardTitle>
//                   {AnnualReport.length === 0 && (
//                     <CardText>No annual reports available.</CardText>
//                   )}
//                   <Row>
//                     {AnnualReport.map((report, idx) => (
//                       <Col md="3" key={idx} style={{ marginBottom: "0.75rem" }}>
//                         <a
//                           href={report.Download_link}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           style={{
//                             color: "#3E3EE1",
//                             textDecoration: "underline",
//                             textDecorationColor: "#4e69c8",
//                             fontWeight: 500,
//                             textDecorationThickness: "1px",
//                             textUnderlineOffset: "4px",
//                           }}
//                         >
//                           Financial Year {report.Year}
//                         </a>
//                         {params.company === "476" && report.Year === 2024 && (
//                           <a
//                             href={annualReportlink}
//                             target="_blank"
//                             className=""
//                           >
//                             {" "}
//                             <i className="ri-file-download-line align-middle">
//                               Summary
//                             </i>{" "}
//                           </a>
//                         )}
//                         {/* <CardText style={{ fontSize: '0.85rem', color: '#555' }}>
//                                                     from bse
//                                                 </CardText> */}
//                       </Col>
//                     ))}
//                   </Row>
//                 </CardBody>
//               </Card>
//             </Col>
//           </Row>

//           <Row>
//             <Col md="12" className="mb-4">
//               <Card>
//                 <CardBody>
//                   <CardTitle tag="h4" className="mb-3">
//                     Credit Rating
//                   </CardTitle>
//                   {CreditRating.length === 0 && (
//                     <CardText>No annual reports available.</CardText>
//                   )}
//                   <Row>
//                     {CreditRating.map((report, idx) => (
//                       <Col md="3" key={idx} style={{ marginBottom: "0.75rem" }}>
//                         <a
//                           href={report["Credit Rating URL"]}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           style={{
//                             color: "#3E3EE1",
//                             textDecoration: "underline",
//                             fontWeight: 500,
//                             textDecorationColor: "#4e69c8",
//                             textDecorationThickness: "1px",
//                             textUnderlineOffset: "4px",
//                           }}
//                         >
//                           {report.Date.split("from")[1].toUpperCase()}
//                         </a>
//                         {params.company === "476" && report.Year === 2024 && (
//                           <a
//                             href={annualReportlink}
//                             target="_blank"
//                             className=""
//                           >
//                             {" "}
//                             <i className="ri-file-download-line align-middle">
//                               Summary
//                             </i>{" "}
//                           </a>
//                         )}
//                         <CardText
//                           style={{ fontSize: "0.85rem", color: "#555" }}
//                         >
//                           {report.Date.split("from")[0]}
//                         </CardText>
//                       </Col>
//                     ))}
//                   </Row>
//                 </CardBody>
//               </Card>
//             </Col>
//           </Row>

//           <Row>
//             <Col md="12" className="mb-4">
//               <Card>
//                 <CardBody>
//                   <CardTitle tag="h4" className="mb-3">
//                     Conference Calls
//                   </CardTitle>
//                   {ConferenceCall?.length === 0 && (
//                     <CardText>No Data available.</CardText>
//                   )}
//                   <Row>
//                     {ConferenceCall?.map((doc, idx) => (
//                       <Col md="3" key={idx} style={{ marginBottom: "0.75rem" }}>
//                         <a
//                           href={doc.URL}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           style={{
//                             color: "#3E3EE1",
//                             textDecoration: "underline",
//                             fontWeight: 500,
//                             display: "block",
//                             marginBottom: "0.3rem",
//                             textDecorationColor: "#4e69c8",
//                             textDecorationThickness: "1px",
//                             textUnderlineOffset: "4px",
//                           }}
//                         >
//                           {"Investor Meet - Outcome"}
//                         </a>
//                         <CardText
//                           style={{ fontSize: "0.85rem", color: "#555" }}
//                         >
//                           {doc["Date/Month-Year"] ||
//                             "No additional details available"}
//                         </CardText>
//                       </Col>
//                     ))}
//                   </Row>
//                 </CardBody>
//               </Card>
//             </Col>
//           </Row>

//           {/* ------------------------------------------- Announcements ------------------------------------ */}
//           {/* <Row>
//                         <Col md="12" className="mb-4">
//                             <Card>
//                                 <CardBody>
//                                     <CardTitle tag="h4" className="mb-3">
//                                         Announcements
//                                     </CardTitle>
//                                     {Announcements?.length === 0 && (
//                                         <CardText>No announcements available.</CardText>
//                                     )}
//                                     <Row>
//                                         {Announcements?.map((group, idx) => (
//                                             <Row key={idx} style={{ marginBottom: '1.5rem' }}>
//                                                 <h5>{group._id || 'Untitled Group'}</h5>
//                                                 {group.docs.map((doc, i) => (
//                                                     <Col md="4" key={i} style={{ marginBottom: '0.75rem' }}>
//                                                         <a
//                                                             href={doc.URL}
//                                                             target="_blank"
//                                                             rel="noopener noreferrer"
//                                                             style={{
//                                                                 color: '#4e69c8',
//                                                                 textDecoration: 'none',
//                                                                 fontWeight: 500,
//                                                                 display: 'block',
//                                                                 marginBottom: '0.3rem',
//                                                             }}
//                                                         >
//                                                             {doc.Field1 || 'View Announcement'}
//                                                         </a>
//                                                         <CardText style={{ fontSize: '0.85rem', color: '#555' }}>
//                                                             {extractDisseminatedTime(doc['ng-scope2']) || 'No additional details available'}
//                                                         </CardText>
//                                                     </Col>
//                                                 ))}
//                                             </Row>
//                                         ))}
//                                     </Row>
//                                 </CardBody>
//                             </Card>
//                         </Col>
//                     </Row> */}
//         </>
//       )}
//     </div>
//   );
// };

// export default Documents;

import React, { useEffect, useState, useRef } from "react";
import { Spinner } from "reactstrap";
import { useParams } from "react-router-dom";
import {
  getCompanyCode,
  getDocumentsData,
} from "../../../Unfluke_helpers/backend_helper";

const Documents = ({ companyName }) => {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [companyCode, setCompanyCode] = useState(null);
  const [ASCR, setASCR] = useState([]);
  const [CreditRating, setCreditRating] = useState([]);
  const [AnnualReport, setAnnualReport] = useState([]);
  const [Announcements, setAnnouncements] = useState([]);
  const [ConferenceCall, setConferenceCall] = useState([]);
  const lastFetchedCompanyName = useRef(null);
  const [annualReportlink] = useState(
    "https://api.unfluke.in/api/historicdata/getannual",
        // "http://10.184.31.9:80/api/historicdata/getannual",
  );

  useEffect(() => {
    if (lastFetchedCompanyName.current === companyName) return;

    async function getData() {
      setLoading(true);
      try {
        const result = await getCompanyCode({
          params: { instrument: params.company },
        });

        if (result?.code) {
          const response = await getDocumentsData({
            params: { instrument: result.code },
          });

          setASCR(response.ASCR || []);
          setAnnualReport(response.AnnualReport || []);
          setAnnouncements(response.Announcement || []);
          setConferenceCall(response.ConferenceCalls || []);
          setCreditRating(response.CreditRating || []);
          setCompanyCode(result.code);
        } else {
          setASCR([]);
          setAnnouncements([]);
          setAnnualReport([]);
          setConferenceCall([]);
          setCreditRating([]);
        }
      } catch (error) {
        console.error("Error fetching company code:", error);
        setASCR([]);
        setAnnouncements([]);
        setAnnualReport([]);
        setConferenceCall([]);
        setCreditRating([]);
      } finally {
        setLoading(false);
        lastFetchedCompanyName.current = companyName;
      }
    }

    getData();
  }, [companyName]);

  return (
    <div className="mt-4">
      {loading ? (
        <div className="flex items-center justify-center h-32 bg-transparent">
          <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Annual Reports */}
            <div className="bg-white border  dark:bg-gray-900 p-6 rounded-lg">
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-blue-600 dark:text-blue-400">📄</span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Annual Reports
                </h2>
              </div>

              <div className="grid h-[500px] p-2 custom-scrollbar overflow-y-auto grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {AnnualReport.length > 0 ? (
                  AnnualReport.map((report, index) => (
                    <a
                      key={index}
                      href={report.Download_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer flex flex-col justify-between"
                    >
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                        Financial Year {report.Year}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {params.company === "476" && report.Year === 2024 ? (
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-600 dark:bg-blue-600 text-white">
                            Summary
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            Available
                          </span>
                        )}
                      </div>
                    </a>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 col-span-full">
                    No annual reports available.
                  </p>
                )}
              </div>
            </div>

            {/* Credit Ratings */}
            {/* <div className="bg-white dark:bg-gray-900 p-6 rounded-lg">
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-yellow-500">⭐</span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Credit Ratings
                </h2>
              </div>

              <div className="space-y-4">
                {CreditRating.length > 0 ? (
                  CreditRating.map((rating, index) => (
                    <a
                      key={index}
                      href={rating["Credit Rating URL"]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between py-3 px-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="font-medium text-gray-900 dark:text-white w-20">
                          {rating.Agency || "N/A"}
                        </span>
                        <span
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            rating.Rating === "AAA"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                          }`}
                        >
                          {rating.Rating}
                        </span>
                      </div>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {rating.Date?.split("from")[0]?.trim() || "N/A"}
                      </span>
                    </a>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No credit ratings available.
                  </p>
                )}
              </div>
            </div> */}

            <div className="bg-white border dark:bg-gray-900 p-6 rounded-lg">
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-yellow-500">⭐</span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Credit Ratings
                </h2>
              </div>

              {CreditRating.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
                  {CreditRating.map((report, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-900 p-4 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-700  transition-shadow"
                    >
                      <a
                        href={report["Credit Rating URL"]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-700  dark:text-blue-400 font-bold mb-2 hover:underline"
                      >
                        {report.Date?.split("from")[1]?.trim()?.toUpperCase() ||
                          "View Rating"}
                      </a>

                      {params.company === "476" && report.Year === 2024 && (
                        <a
                          href={annualReportlink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md"
                        >
                          <i className="ri-file-download-line align-middle mr-1"></i>
                          Summary
                        </a>
                      )}

                      <span className="text-xs text-gray-500 dark:text-gray-400 block mt-2">
                        {report.Date?.split("from")[0]?.trim() ||
                          "Date not available"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No credit ratings available.
                </p>
              )}
            </div>
          </div>

          {/* Conference Calls */}
          <div className="mt-8">
            <div className="bg-white border dark:bg-gray-900 p-6 rounded-lg">
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-green-600 dark:text-green-400">📞</span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Conference Calls
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ConferenceCall.length > 0 ? (
                  ConferenceCall.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors duration-200 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer"
                    >
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                        Investor Meet - Outcome
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          {doc["Date/Month-Year"] || "No date provided"}
                        </span>
                        <span className="text-gray-400 dark:text-gray-500">
                          📅
                        </span>
                      </div>
                    </a>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 col-span-full">
                    No conference calls available.
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Documents;
