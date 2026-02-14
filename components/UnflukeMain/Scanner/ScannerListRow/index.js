import React from 'react'
import { Link } from 'react-router-dom'

const ScannerListRow = ({i, row, alerts}) => {
    return (
        <tr>
            <td className="fw-medium">{i+1}</td>
            <td>
                <Link
                    to={!alerts ? `/scanner` : "/alert"}
                    state={row}
                >
                    {row.name}
                </Link>
            </td>
            <td>
                {row.publicChecked ? "Public" : "Private"}
            </td>
            <td>
                {row.date}
            </td>
            <td>
                <div className="col-xl-3 col-lg-4 col-sm-6">
                    <Link>
                        <i className="mdi mdi-delete" style={{
                            fontSize: 20
                        }}></i>
                    </Link>
                </div>
            </td>
            <td>
                <div className="col-xl-3 col-lg-4 col-sm-6">
                    <Link>
                        <i className="mdi mdi-file-edit" style={{
                            fontSize: 20
                        }}></i>
                    </Link>
                </div>
            </td>
        </tr>
    )
}

export default ScannerListRow