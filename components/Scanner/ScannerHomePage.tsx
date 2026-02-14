import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Nav,
  NavItem,
  NavLink,
  Row,
  Spinner,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "reactstrap";
// import BreadCrumb from "../../components/Common/BreadCrumb";
import ScannerListRow from "../../components/UnflukeMain/Scanner/ScannerListRow";
import axios from "axios";
import { useSelector } from "react-redux";
// import classnames from "classnames";
import { Link, useNavigate } from "react-router-dom";
import TableContainer from "../../components/UnflukeMain/Common/TableContainerReactTable";

import { ToastContainer, toast } from "react-toastify";
import { deepCopy } from "../../../Components/UnflukeMain/BasicBacktester/StrategyLegs/utils";
import {
  darkErrorToastOps,
  successToastOps,
} from "../../../Components/UnflukeMain/Utils/common_vars";

const ScannerHomePage = ({ alerts }) => {
  useEffect(() => {
    document.title = alerts ? "Alerts | Unfluke" : "Scanners | Unfluke";
  }, [alerts]);

  const [scanners, setScanners] = useState([]);
  const [publicScanners, setPublicScanners] = useState({});
  const [loading, setLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteScannerId, setDeleteScannerId] = useState(null);
  const [deleteScannerOwner, setDeleteScannerOwner] = useState(null);

  const auth = useSelector((state) => state.Login);
  const navigate = useNavigate();
  const globalState = useSelector((store) => store.Layout);
  const [subUrl, setSubUrl] = useState("");

  const toggleDeleteModal = () => setDeleteModalOpen(!deleteModalOpen);

  const confirmDelete = () => {
    if (!deleteScannerId) return;
    axios
      .post(`${process.env.REACT_APP_BACKEND_URL}/api/scanner/deleteScanner`, {
        scannerId: deleteScannerId,
      })
      .then((res) => {
        if (res) {
          toast.success(!alerts ? "Scanner deleted" : "Alert deleted");
          const tmp = deepCopy(scanners);
          setScanners(tmp.filter((x) => x._id !== deleteScannerId));
        }
      })
      .catch((err) => console.log(err))
      .finally(() => {
        toggleDeleteModal();
        setDeleteScannerId(null);
        setDeleteScannerOwner(null);
      });
  };

  async function handleShare(scannerId) {
    const scannerState = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/api/scanner/getScannerById`,
      {
        id: scannerId,
      },
    );

    if (scannerState) {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/scanner/generateSharingUrl`,
        {
          scannerState,
        },
      );

      if (res && res.data?.sharingCode) {
        const type = alerts ? "alert" : "scanner";
        const link = `${process.env.REACT_APP_PUBLIC_URL}/scanner-sharing?code=${res.data.sharingCode}&alert=false&type=${type}&market=in`;

        navigator.clipboard.writeText(link).then(
          function () {
            toast.success("Link copied to clipboard", successToastOps);
          },
          function () {
            toast.error("Could not copy Link", darkErrorToastOps);
          },
        );
      }
    }
  }

  const columns_default = useMemo(
    () => [
      {
        header: !alerts ? "Scanner name" : "Alert name",
        accessorKey: "name",
        enableColumnFilter: false,
        cell: (cell) => {
          return (
          <div className="flex justify-center">
              <Link
              to={cell.row.original.scannerType === "technical" ? `/${subUrl}/scanner` : cell.row.original.scannerType === "fundamental" ? `/${subUrl}/scanner-funda` : `/${subUrl}/alerts`}
              state={cell.row.original}
               className="font-semibold text-blue-600 hover:underline truncate max-w-[180px] block"
            >
              {cell.getValue()}
            </Link>
          </div>
          );
        },
      },
      {
        header: "Type",
        accessorKey: "scannerType",
        enableColumnFilter: false,
        cell: (cellProps) => {
          return (
            <div>{cellProps.getValue() === "technical" ? "Technical" : cellProps.getValue() === "fundamental" ? "Fundamental" : "Alert"}</div>
          );
        },
      },
      {
        header: "Creation date",
        accessorKey: "date",
        enableColumnFilter: false,
      },
      {
        header: "Actions",
        enableColumnFilter: false,
        cell: (cell) => {
          return (
            <>
              <ul className="list-inline  gap-2 mb-0">
                <li className="list-inline-item">
                  <Link
                    to="#"
                    className="text-danger d-inline-block remove-item-btn"
                    onClick={() => {
                      setDeleteScannerId(cell.row.original._id);
                      setDeleteScannerOwner(cell.row.original.owner);
                      setDeleteModalOpen(true);
                    }}
                  >
                    <i className="ri-delete-bin-5-fill fs-16"></i>
                  </Link>

                  <Link
                    to="#"
                    className="d-inline-block remove-item-btn ms-2"
                    onClick={() => {
                      handleShare(cell.row.original._id);
                    }}
                  >
                    <i className="ri-share-line fs-16"></i>
                  </Link>
                </li>
              </ul>
            </>
          );
        },
      },
    ],
    [subUrl, alerts],
  );

  useEffect(() => {
    if (globalState && globalState.appType) {
      setSubUrl(globalState.appType);
    }
  }, [globalState]);

  useEffect(() => {
    if (auth.user._id !== undefined && auth.user._id !== "") {
      axios
        .post(`${process.env.REACT_APP_BACKEND_URL}/api/scanner/getScanners`, {
          id: auth.user._id,
          alerts: alerts ? alerts : false,
        })
        .then((res) => {
          setLoading(false);
          setScanners(res);
        })
        .catch((err) => console.log(err));
    }
  }, [auth, alerts]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/scanner/getAdminScanners`)
      .then((res) => {
        if (res && Object.keys(res).length > 0) {
          setPublicScanners(res);
          setLoading(false);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const SkeletonRow = () => (
    <tr>
      <td>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
      </td>
      <td>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
      </td>
      <td>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
      </td>
      <td>
        <div className="flex gap-2">
          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </td>
    </tr>
  );

  const TableSkeleton = () => (
    <>
      <div className="h-10 w-1/2 mb-2 mt-2 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
      <div className="table-responsive">
        <table className="table align-middle table-nowrap">
          <tbody>
            {[...Array(8)].map((_, index) => (
              <SkeletonRow key={index} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  return (
    <React.Fragment>
      <div className="page-content  rounded-lg  m-0 pt-24 px-2 sm:px-8 md:px-16 lg:px-6">
        <Container fluid>
          <div className="flex flex-col  sm:flex-row sm:items-center sm:justify-between pb-4 max-sm:pb-2 gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {!alerts ? "Scanners" : "Alerts"}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {!alerts ? "Pages / Scanners" : "Pages / Alerts"}
                </p>
              </div>
            </div>
          </div>
          <Row>
            <Col xs={12}>
              <Card className="rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-700 bg-white">
                <CardHeader className="rounded-lg dark:bg-gray-800 border-0">
                  <Row className="align-items-center gy-3">
                    <div className="col-sm">
                      <h5 className="card-title mb-0">Home</h5>
                    </div>
                    <div className="col-sm-auto">
                      <div className="d-flex gap-1 flex-wrap">
                        <button
                          type="button"
                          className="btn bg-blue-600 text-white add-btn"
                          onClick={() =>
                            navigate(
                              !alerts
                                ? `/${subUrl}/scanner`
                                : `/${subUrl}/alerts`,
                            )
                          }
                        >
                          <i className="ri-add-line align-bottom me-1"></i>{" "}
                          Create new
                        </button>
                      </div>
                    </div>
                  </Row>
                </CardHeader>
                <CardBody className="pt-0 dark:bg-gray-800 rounded-lg border-gray-700">
                  <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="inline-flex">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-semibold text-blue-600 border-b-2 border-blue-600 bg-transparent focus:outline-none"
                    >
                      <i className="ri-store-2-fill mr-1 align-middle"></i>
                      {!alerts ? "Your scanners" : "Your alerts"}
                    </button>
                  </div>
                </div>
                  {!loading ? (
                    scanners.length > 0 ? (
                      <TableContainer
                        columns={columns_default}
                        data={scanners || []}
                        isGlobalFilter={true}
                        isAddUserList={false}
                        customPageSize={8}
                        divClass="table-responsive table-card mb-1"
                        tableClass="align-middle table-nowrap"
                        theadClass="table-light text-muted"
                        handleOrderClick={() => {}}
                        isOrderFilter={true}
                        SearchPlaceholder="Search..."
                      />
                    ) : (
                      <div className="container p-5 text-center">
                        <p className="mt-2">
                          {!alerts ? "No scanners found." : "No alerts found."}
                        </p>
                      </div>
                    )
                  ) : (
                    <TableSkeleton />
                  )}
                  <ToastContainer closeButton={false} limit={1} />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={deleteModalOpen} toggle={toggleDeleteModal}>
          <ModalHeader toggle={toggleDeleteModal}>Confirm Delete</ModalHeader>
          <ModalBody>
            Are you sure you want to delete this {alerts ? "alert" : "scanner"}?
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={toggleDeleteModal}>
              Cancel
            </Button>
            <Button color="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </React.Fragment>
  );
};

export default ScannerHomePage;
