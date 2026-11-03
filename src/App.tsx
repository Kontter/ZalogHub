import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type Filter = "all" | "active" | "completed";

type Task = {
    id: string;
    title: string;
    completed: boolean;
};

const STORAGE_KEY = "tasks_list";
const DEFAULT_NEW_TASK = "";

const filters: { value: Filter; label: string }[] = [
    { value: "all", label: "Все" },
    { value: "active", label: "Активные" },
    { value: "completed", label: "Выполненные" },
];

const loadTasks = (): Task[] => {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);
        return savedTasks ? JSON.parse(savedTasks) : [];
    } catch {
        return [];
    }
};

const App = () => {
    const [tasks, setTasks] = useState<Task[]>(loadTasks);
    const [newTask, setNewTask] = useState(DEFAULT_NEW_TASK);
    const [filter, setFilter] = useState<Filter>("all");

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        if (filter === "active") return tasks.filter((task) => !task.completed);
        if (filter === "completed")
            return tasks.filter((task) => task.completed);
        return tasks;
    }, [filter, tasks]);

    const activeTaskCount = tasks.filter((task) => !task.completed).length;
    const completedTaskCount = tasks.length - activeTaskCount;
    const filterTaskCounts: Record<Filter, number> = {
        all: tasks.length,
        active: activeTaskCount,
        completed: completedTaskCount,
    };

    const addTask = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const newTaskValue = newTask.trim();

        if (!newTaskValue) return;

        setTasks((currentTasks) => [
            ...currentTasks,
            { id: crypto.randomUUID(), title: newTaskValue, completed: false },
        ]);
        setNewTask(DEFAULT_NEW_TASK);
    };

    const toggleTask = (id: string) => {
        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task.id === id ? { ...task, completed: !task.completed } : task,
            ),
        );
    };

    const deleteTask = (id: string) => {
        setTasks((currentTasks) =>
            currentTasks.filter((task) => task.id !== id),
        );
    };

    return (
        <main className="h-screen px-4 py-10">
            <section className="mx-auto max-w-2xl">
                <header className="mb-8 sm:mb-10 block w-fit m-auto">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        Список задач
                    </h1>
                </header>

                <div className="p-6 flex flex-col gap-7 overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-xl shadow-slate-200/60 backdrop-blur">
                    <form
                        className="flex flex-col gap-3 border-b border-slate-100 sm:flex-row"
                        onSubmit={addTask}
                    >
                        <input
                            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="Текст задачи"
                        />
                        <button
                            className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-45"
                            type="submit"
                            disabled={!newTask.trim()}
                        >
                            Добавить
                        </button>
                    </form>

                    <div className="bg-gray-200 rounded-xl border border-gray-400">
                        <div className="flex items-center min-w-full rounded-xl sm:w-fit">
                            {filters.map((item) => (
                                <button
                                    key={item.value}
                                    className={`cursor-pointer grow flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 sm:flex-row sm:gap-2 sm:px-3 sm:text-sm ${
                                        filter === item.value
                                            ? "bg-white text-slate-900"
                                            : "text-slate-500 hover:text-slate-800 hover:bg-gray-100"
                                    }`}
                                    type="button"
                                    onClick={() => setFilter(item.value)}
                                >
                                    <span>{item.label}</span>
                                    <span
                                        className={`min-w-7 min-h-7 max-w-9 max-h-9 rounded-full p-1 ${
                                            filter === item.value
                                                ? "bg-indigo-100 text-indigo-600"
                                                : "bg-slate-200 text-slate-500"
                                        }`}
                                    >
                                        {filterTaskCounts[item.value] > 99
                                            ? "99+"
                                            : filterTaskCounts[item.value]}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredTasks.length > 0 ? (
                        <ul className="divide-y divide-slate-200">
                            {filteredTasks.map((task) => (
                                <li
                                    key={task.id}
                                    className="group flex items-center gap-3 transition hover:bg-slate-100"
                                >
                                    <button
                                        className={`cursor-pointer grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 ${
                                            task.completed
                                                ? "border-indigo-500 bg-indigo-500 text-white"
                                                : "border-slate-300 bg-white text-transparent hover:border-indigo-400"
                                        }`}
                                        type="button"
                                        onClick={() => toggleTask(task.id)}
                                    >
                                        <svg
                                            className="h-3.5 w-3.5"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                        >
                                            <path
                                                d="m4 10.5 3.5 3.5L16 5.5"
                                                stroke="currentColor"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </button>

                                    <span
                                        className={`min-w-0 flex-1 break-words text-base transition ${
                                            task.completed
                                                ? "text-slate-400 line-through decoration-slate-300"
                                                : "text-slate-700"
                                        }`}
                                    >
                                        {task.title}
                                    </span>

                                    <button
                                        className=" cursor-pointer rounded-lg p-2 text-slate-400 opacity-70 transition hover:bg-rose-50 hover:text-rose-500 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 sm:opacity-0 sm:group-hover:opacity-100"
                                        type="button"
                                        onClick={() => deleteTask(task.id)}
                                    >
                                        <svg
                                            className="h-5 w-5"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 10v6m4-6v6" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-6 py-16 text-center">
                            <p className="font-semibold text-slate-700">
                                {filter === "all"
                                    ? "Задач пока нет"
                                    : filter === "active"
                                      ? "Все задачи выполнены"
                                      : "Выполненных задач пока нет"}
                            </p>
                            <p className="text-sm text-slate-400">
                                {filter === "all"
                                    ? "Добавьте первую задачу выше"
                                    : "Выберите другой фильтр или добавьте новую задачу"}
                            </p>
                        </div>
                    )}

                    {tasks.length > 0 && (
                        <footer className="border-t border-slate-100 text-sm text-slate-400">
                            Всего {tasks.length} · Выполнено{" "}
                            {completedTaskCount}
                        </footer>
                    )}
                </div>
            </section>
        </main>
    );
};

export default App;
