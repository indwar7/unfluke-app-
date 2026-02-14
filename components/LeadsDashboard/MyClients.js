import React, { useState, useMemo } from 'react';

const MyClients = ({ user }) => {
    const activatedClients = useMemo(() => 
        user.partnerList?.filter(client => client.status.includes("Activated")), 
        [user.partnerList]
    );

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const totalPages = Math.ceil(activatedClients?.length / itemsPerPage);

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Memoize the filtered data based on the search term
    const filteredClients = useMemo(() => {
        return activatedClients?.filter(client =>
            client.hisReferral.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [activatedClients, searchTerm]);

    // Calculate the items to display for the current page
    const displayedClients = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredClients?.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredClients, currentPage, itemsPerPage]);

    return (
        <div className="col-lg-12">
            <div className="card">
                <div className="header">
                    <h2>My Clients</h2>
                    <input
                        style={{ float: "right" }}
                        type="text"
                        placeholder="Search by Client ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="body table-responsive">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>Sl No.</th>
                                <th>Client ID</th>
                                <th>Client Name</th>
                                <th>Activation Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedClients?.length > 0 ? (
                                displayedClients.map((client, index) => (
                                    <tr key={index}>
                                        <th scope="row">{(currentPage - 1) * itemsPerPage + index + 1}</th>
                                        <td>{client.hisReferral}</td>
                                        <td>{client.name}</td>
                                        <td>{new Date(client.activationDate).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: "center" }}>No clients found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "10px" }}>
                        <button 
                            style={{ margin: "0 20px", padding: "6px 12px" }} 
                            onClick={handlePrevious} 
                            disabled={currentPage === 1}>
                            Previous
                        </button>
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button 
                            style={{ margin: "0 20px", padding: "6px 12px" }} 
                            onClick={handleNext} 
                            disabled={currentPage === totalPages}>
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MyClients;
