import React, { useState, useMemo } from 'react';
import TableContainer from '../../Components/UnflukeMain/Common/TableContainer';
import { AppId, Name } from './TableCols';
import { Card, CardBody, CardHeader,Form,Row,Col,Input, Button } from 'reactstrap';
import Flatpickr from "react-flatpickr";
import Select from "react-select";

const Leads = ({ user }) => {
    const partnerList = user?.partnerList || [];
    const itemsPerPage = 20;

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('');


    const option = [
        {
          options: [
            { label: "All Accounts", value: "All Accounts" },
            { label: "Activated", value: "Activated" },
            { label: "Created", value: "Created" },

          ],
        },
      ];

    const totalPages = Math.ceil(partnerList.length / itemsPerPage);

    // Memoized filtered data based on filter and search term
    const filteredData = useMemo(() => {
        let data = partnerList;

        if (filter) {
            data = data.filter(item => item.status.includes(filter));
        }

        if (searchTerm) {
            data = data.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        return data;
    }, [partnerList, filter, searchTerm]);

    const columns = useMemo(
        () => [
            {
                header: "Sl No.",
                accessorKey: "id",
                enableColumnFilter: false,
                cell: (cell) => {
                    return <AppId {...cell} />;
                },
            },
            {
                header: "Name",
                accessorKey: "name",
                enableColumnFilter: false,
                cell: (cell) => {
                    return <Name {...cell} />;
                },
            },
            {
                header: "Created Date",
                accessorKey: "date",
                enableColumnFilter: false,
                cell: (cell) => <>{cell.getValue()} </>,
            },
            {
                header: "Status",
                accessorKey: "status",
                enableColumnFilter: false,
                cell: (cell) => {
                    return <Status {...cell} />;
                },
            },
            {
                header: "Last Updated",
                accessorKey: "date",
                enableColumnFilter: false,
                cell: (cell) => <>{cell.getValue()} </>,
            },

        ],
        []
    );


    return (
        <div className="col-lg-12">
            <Card>
            <CardHeader className="border-0">
                  <div className="d-md-flex align-items-center">
                    <h5 className="card-title mb-3 mb-md-0 flex-grow-1">
                      Leads
                    </h5>
               
                  </div>
                </CardHeader>
                <CardBody className="border border-dashed border-end-0 border-start-0">
                    <Form>
                        <Row className="g-3">
                            <Col xxl={3} sm={3}>
                                <div className="search-box">
                                    <Input
                                        type="text"
                                        className="form-control search"
                                        placeholder="Search for Name"
                                    />
                                    <i className="ri-search-line search-icon"></i>
                                </div>
                            </Col>
                            {/* <Col xxl={2} sm={6}>
                                <div>
                                    <Flatpickr
                                        className="form-control"
                                        id="datepicker-publish-input"
                                        placeholder="Select date"
                                        options={{
                                            altInput: true,
                                            altFormat: "F j, Y",
                                            mode: "multiple",
                                            dateFormat: "d.m.y",
                                        }}
                                    />
                                </div>
                            </Col> */}
                            <Col xxl={2} sm={4}>
                                <div>
                                    <Select
                                        options={option}
                                        name="choices-single-default"
                                        id="idStatus"
                                    ></Select>
                                </div>
                            </Col>
                            <Col xxl={1} sm={4}>
                                <div>
                                    <Button
                                        type="button"
                                        color="primary"
                                        className="btn w-100"
                                    // onclick=""
                                    >
                                        {" "}
                                        <i className="ri-equalizer-fill me-1 align-bottom"></i>
                                        Filters
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </CardBody>
                <CardBody>
                <div >
                    <TableContainer
                        columns={columns}
                        data={partnerList || []}
                        customPageSize={8}
                        divClass="table-responsive table-card mb-1"
                        tableClass="align-middle table-nowrap"
                        theadClass="table-light text-muted"
                        />
                </div >
                        </CardBody>
        
            </Card>
        </div>
    );
};

export default Leads;
