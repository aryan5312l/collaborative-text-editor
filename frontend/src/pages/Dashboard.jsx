import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../utils/auth";

export default function Dashboard() {
    const [ownedDocs, setOwnedDocs] = useState([]);
    const [sharedDocs, setSharedDocs] = useState([]);
    const navigate = useNavigate();
    const [titles, setTitles] = useState({});
    const [emails, setEmails] = useState({});

    const user = JSON.parse(localStorage.getItem("user"));

    const fetchDocuments = async () => {
        const res = await fetch("http://localhost:5000/api/docs", {
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        });

        const data = await res.json();

        setOwnedDocs(data.ownedDocs || []);
        setSharedDocs(data.sharedDocs || []);
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

    const updateTitle = async (docId) => {
        const title = titles[docId];

        if (!title) return;

        await fetch(`http://localhost:5000/api/docs/${docId}/title`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getToken()}`
            },
            body: JSON.stringify({ title })
        });

        fetchDocuments();
    };

    const shareDocument = async (docId) => {
        const email = emails[docId];

        if (!email) return;

        await fetch(`http://localhost:5000/api/docs/${docId}/share`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getToken()}`
            },
            body: JSON.stringify({ email, permission: "write" })
        });
        fetchDocuments();

        alert("Document shared successfully");
    };


    useEffect(() => {
        fetchDocuments();
    }, []);

    return (
        <div>
            <h2>My Documents</h2>

            <button onClick={createDocument}>Create New Document</button>

            {ownedDocs.map((doc) => (
                <div key={doc._id}>
                    <h3>{doc.title}</h3>
                    <p>{new Date(doc.createdAt).toLocaleDateString()}</p>

                    <button onClick={() => navigate(`/doc/${doc.docId}`)}>Edit</button>
                    <button onClick={() => deleteDocument(doc.docId)}>Delete</button>

                    {/* Title update */}
                    <input
                        type="text"
                        placeholder="New Title"
                        value={titles[doc.docId] || ""}
                        onChange={(e) =>
                            setTitles(prev => ({
                                ...prev,
                                [doc.docId]: e.target.value
                            }))
                        }
                    />
                    <button onClick={() => updateTitle(doc.docId)}>Update Title</button>

                    {/* Share */}
                    <input
                        type="email"
                        placeholder="Share with email"
                        value={emails[doc.docId] || ""}
                        onChange={(e) =>
                            setEmails(prev => ({
                                ...prev,
                                [doc.docId]: e.target.value
                            }))
                        }
                    />
                    <button onClick={() => shareDocument(doc.docId)}>Share</button>
                </div>
            ))}

            <h2>Shared With Me</h2>

            {sharedDocs.map((doc) => (
                <div key={doc._id}>
                    <h3>{doc.title}</h3>
                    <p>{new Date(doc.createdAt).toLocaleDateString()}</p>

                    <button onClick={() => navigate(`/doc/${doc.docId}`)}>
                        Open
                    </button>

                    {/* Show permission */}
                    <p>
                        Permission:{" "}
                        {
                            doc.sharedWith.find(
                                u => u.userId === user?._id
                )?.permission || "read"
                        }
                    </p>
                </div>
            ))}
        </div>
    );
}
