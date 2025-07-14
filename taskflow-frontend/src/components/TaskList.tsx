import React, { useEffect, useState } from "react";
import type { Task } from "../types/Task";

const API_URL = "http://localhost:5149/api/tasks";

const TaskList: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editDate, setEditDate] = useState("");

    const fetchTasks = () => {
        setLoading(true);
        fetch(API_URL)
            .then((res) => res.json())
            .then((data) => {
                setTasks(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching tasks:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError(null);
        const newTask = {
            title,
            description,
            isCompleted: false,
            createdAt: new Date().toISOString(),
        };
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTask),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData?.title || "Error creating task");
            }
            setTitle("");
            setDescription("");
            fetchTasks();
        } catch (err: any) {
            setError(err.message || "Error creating task");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Error deleting task");
            fetchTasks();
        } catch (err: any) {
            setError(err.message || "Error deleting task");
        }
    };

    const handleEdit = (task: Task) => {
        setEditingId(task.id);
        setEditTitle(task.title);
        setEditDescription(task.description || "");
        setEditDate(task.createdAt.slice(0, 10)); // YYYY-MM-DD
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditTitle("");
        setEditDescription("");
        setEditDate("");
    };

    const handleEditSave = async (task: Task) => {
        setError(null);
        try {
            const updatedTask = {
                ...task,
                title: editTitle,
                description: editDescription,
                createdAt: editDate ? new Date(editDate).toISOString() : task.createdAt,
            };
            const res = await fetch(`${API_URL}/${task.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedTask),
            });
            if (!res.ok) throw new Error("Error updating task");
            setEditingId(null);
            setEditTitle("");
            setEditDescription("");
            setEditDate("");
            fetchTasks();
        } catch (err: any) {
            setError(err.message || "Error updating task");
        }
    };

    const handleToggleCompleted = async (task: Task) => {
        setError(null);
        try {
            const updatedTask = {
                ...task,
                isCompleted: !task.isCompleted,
            };
            const res = await fetch(`${API_URL}/${task.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedTask),
            });
            if (!res.ok) throw new Error("Error updating task");
            fetchTasks();
        } catch (err: any) {
            setError(err.message || "Error updating task");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2>Task List</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    maxLength={100}
                    style={{ marginRight: 8 }}
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    maxLength={500}
                    style={{ marginRight: 8 }}
                />
                <button type="submit" disabled={creating || !title}>
                    {creating ? "Creating..." : "Add Task"}
                </button>
            </form>
            {error && <div style={{ color: "red" }}>{error}</div>}
            {tasks.length === 0 ? (
                <p>No tasks found.</p>
            ) : (
                <ul>
                    {tasks.map((task) => (
                        <li key={task.id}>
                            {editingId === task.id ? (
                                <>
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={e => setEditTitle(e.target.value)}
                                        maxLength={100}
                                        style={{ marginRight: 8 }}
                                    />
                                    <input
                                        type="text"
                                        value={editDescription}
                                        onChange={e => setEditDescription(e.target.value)}
                                        maxLength={500}
                                        style={{ marginRight: 8 }}
                                    />
                                    <input
                                        type="date"
                                        value={editDate}
                                        onChange={e => setEditDate(e.target.value)}
                                        style={{ marginRight: 8 }}
                                    />
                                    <button onClick={() => handleEditSave(task)} style={{ marginRight: 4 }}>
                                        Save
                                    </button>
                                    <button onClick={handleEditCancel} type="button">
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <input
                                        type="checkbox"
                                        checked={task.isCompleted}
                                        onChange={() => handleToggleCompleted(task)}
                                        style={{ marginRight: 8 }}
                                    />
                                    <strong>{task.title}</strong> - {task.description}
                                    {task.isCompleted ? " ✅" : ""}
                                    <button onClick={() => handleEdit(task)} style={{ marginLeft: 8 }}>
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(task.id)} style={{ marginLeft: 4 }}>
                                        Delete
                                    </button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
export default TaskList;