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
    const [dueDate, setDueDate] = useState("");
    const [editDueDate, setEditDueDate] = useState("");
    const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
    const [sortBy, setSortBy] = useState<'dueDate' | 'createdAt'>('dueDate');
    const [search, setSearch] = useState("");
    const [toast, setToast] = useState<string | null>(null);

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

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError(null);
        const newTask = {
            title,
            description,
            isCompleted: false,
            createdAt: new Date().toISOString(),
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
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
            setDueDate("");
            fetchTasks();
            showToast("Task created successfully!");
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
            showToast("Task deleted successfully!");
        } catch (err: any) {
            setError(err.message || "Error deleting task");
        }
    };

    const handleEdit = (task: Task) => {
        setEditingId(task.id);
        setEditTitle(task.title);
        setEditDescription(task.description || "");
        setEditDate(task.createdAt.slice(0, 10)); // YYYY-MM-DD
        setEditDueDate(task.dueDate ? task.dueDate.slice(0, 16) : ""); // YYYY-MM-DDTHH:mm
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditTitle("");
        setEditDescription("");
        setEditDate("");
        setEditDueDate("");
    };

    const handleEditSave = async (task: Task) => {
        setError(null);
        try {
            const updatedTask = {
                ...task,
                title: editTitle,
                description: editDescription,
                createdAt: editDate ? new Date(editDate).toISOString() : task.createdAt,
                dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
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
            setEditDueDate("");
            fetchTasks();
            showToast("Task updated successfully!");
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

    const filteredTasks = tasks
        .filter(task => {
            if (search.trim() !== "") {
                const text = (task.title + " " + (task.description || "")).toLowerCase();
                if (!text.includes(search.toLowerCase())) return false;
            }
            if (filter === 'completed') return task.isCompleted;
            if (filter === 'pending') return !task.isCompleted;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'dueDate') {
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return a.dueDate.localeCompare(b.dueDate);
            } else {
                return a.createdAt.localeCompare(b.createdAt);
            }
        });

    if (loading) return <div className="flex justify-center items-center h-64 text-lg font-semibold">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg mt-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Task List</h2>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 mb-6">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    maxLength={100}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    maxLength={500}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                    type="submit"
                    disabled={creating || !title}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {creating ? "Creating..." : "Add Task"}
                </button>
            </form>
            {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
            <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <label className="flex items-center gap-2">
                    <span className="text-gray-700">Filter:</span>
                    <select
                        value={filter}
                        onChange={e => setFilter(e.target.value as any)}
                        className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="all">All</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                    </select>
                </label>
                <label className="flex items-center gap-2">
                    <span className="text-gray-700">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                        className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="dueDate">Due date</option>
                        <option value="createdAt">Created at</option>
                    </select>
                </label>
            </div>
            {filteredTasks.length === 0 ? (
                <p className="text-center text-gray-500">No tasks found.</p>
            ) : (
                <ul className="space-y-4">
                    {filteredTasks.map((task) => (
                        <li key={task.id} className="bg-gray-50 rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-3 shadow-sm border border-gray-100">
                            {editingId === task.id ? (
                                <div className="flex flex-col md:flex-row gap-2 w-full">
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={e => setEditTitle(e.target.value)}
                                        maxLength={100}
                                        className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                    <input
                                        type="text"
                                        value={editDescription}
                                        onChange={e => setEditDescription(e.target.value)}
                                        maxLength={500}
                                        className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                    <input
                                        type="date"
                                        value={editDate}
                                        onChange={e => setEditDate(e.target.value)}
                                        className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                    <input
                                        type="datetime-local"
                                        value={editDueDate}
                                        onChange={e => setEditDueDate(e.target.value)}
                                        className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                    <button
                                        onClick={() => handleEditSave(task)}
                                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={handleEditCancel}
                                        type="button"
                                        className="px-3 py-1 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
                                    <input
                                        type="checkbox"
                                        checked={task.isCompleted}
                                        onChange={() => handleToggleCompleted(task)}
                                        className="mr-2 accent-blue-600 w-5 h-5"
                                    />
                                    <span className={`flex-1 font-semibold text-lg ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.title}</span>
                                    <span className="flex-1 text-gray-600 text-sm">{task.description}</span>
                                    {task.dueDate && (
                                        <span className="ml-2 text-xs text-gray-500 font-medium">
                                            (Due: {new Date(task.dueDate).toLocaleString()})
                                        </span>
                                    )}
                                    {task.isCompleted && <span className="ml-2 text-green-600 text-xl">✔️</span>}
                                    <button
                                        onClick={() => handleEdit(task)}
                                        className="px-3 py-1 bg-yellow-400 text-gray-900 rounded-md hover:bg-yellow-500 transition ml-2"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(task.id)}
                                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition ml-2"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            {toast && (
                <div className="fixed top-6 right-6 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
                    {toast}
                </div>
            )}
        </div>
    );
};
export default TaskList;