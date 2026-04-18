import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../utils/auth";

export default function Dashboard() {
    const [documents, setDocuments] = useState([]);
    const navigate = useNavigate();

    const fetchDocuments = async () => {
        const res = await fetch("http://localhost:5000/api/docs", {
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        });

        const data = await res.json();

        setDocuments(data);
    };

    const createDocument = async () => {
        const res = await fetch("http://localhost:5000/api/docs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getToken()}`
            }
        });

        const doc = await res.json();
        navigate(`/doc/${doc.docId}`);
    };

    const deleteDocument = async (docId) => {
        await fetch(`http://localhost:5000/api/docs/${docId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });

        fetchDocuments();
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    return (
        <div>
            <h2>My Documents</h2>
            <button onClick={createDocument}>Create New Document</button>

            {documents.map((doc) => (
                <div key={doc._id}>
                    <h3>{doc.title}</h3> <p>{doc.createdAt}</p>
                    <button onClick={() => navigate(`/doc/${doc.docId}`)}>Edit</button>
                    <button onClick={() => deleteDocument(doc.docId)}>Delete</button>
                </div>
            ))}
        </div>
    );
}