// Task and list management page.
// Users can create multiple named lists, add tasks with optional due dates
// and priority levels, check tasks off, and delete lists or individual tasks.
//
// Layout: list sidebar on the left, task area on the right (stacked on mobile).

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, ListChecks } from "lucide-react";
import { toast } from "sonner";

interface TaskList { id: string; name: string; }
interface Task {
  id: string; list_id: string; title: string; notes: string | null;
  due_date: string | null; priority: string; completed: boolean;
}

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [lists,      setLists]      = useState<TaskList[]>([]);
  const [tasks,      setTasks]      = useState<Task[]>([]);
  const [activeList, setActiveList] = useState<string | null>(null);
  const [open,         setOpen]         = useState(false);
  const [taskTitle,    setTaskTitle]    = useState("");
  const [taskDue,      setTaskDue]      = useState("");
  const [taskPriority, setTaskPriority] = useState("normal");
  const [newListName,  setNewListName]  = useState("");

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [user, authLoading, navigate]);

  async function loadLists() {
    const { data } = await supabase.from("task_lists").select("id, name").order("created_at", { ascending: true });
    setLists(data ?? []);
    if (data && data.length && !activeList) setActiveList(data[0].id);
  }

  async function loadTasks(listId: string) {
    const { data } = await supabase.from("tasks").select("*").eq("list_id", listId).order("created_at", { ascending: true });
    setTasks(data ?? []);
  }

  useEffect(() => { if (user) loadLists(); }, [user]);
  useEffect(() => { if (activeList) loadTasks(activeList); }, [activeList]);

  async function createList(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newListName.trim()) return;
    const { data, error } = await supabase.from("task_lists").insert({ user_id: user.id, name: newListName.trim() }).select().single();
    if (error) return toast.error(error.message);
    setNewListName("");
    await loadLists();
    if (data) setActiveList(data.id);
    toast.success("List created!");
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !activeList || !taskTitle.trim()) return;
    const { error } = await supabase.from("tasks").insert({
      user_id: user.id, list_id: activeList,
      title: taskTitle.trim(), due_date: taskDue || null, priority: taskPriority,
    });
    if (error) return toast.error(error.message);
    setTaskTitle(""); setTaskDue(""); setTaskPriority("normal");
    setOpen(false);
    loadTasks(activeList);
    toast.success("Task added!");
  }

  async function toggleTask(t: Task) {
    const { error } = await supabase.from("tasks").update({ completed: !t.completed }).eq("id", t.id);
    if (error) return toast.error(error.message);
    setTasks((s) => s.map((x) => x.id === t.id ? { ...x, completed: !x.completed } : x));
  }

  async function deleteTask(id: string) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setTasks((s) => s.filter((x) => x.id !== id));
  }

  async function deleteList(id: string) {
    if (!confirm("Delete this list and all its tasks?")) return;
    const { error } = await supabase.from("task_lists").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setLists((l) => l.filter((x) => x.id !== id));
    if (activeList === id) { setActiveList(null); setTasks([]); }
  }

  if (authLoading || !user) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display text-4xl font-semibold">Tasks & lists</h1>
      <p className="mt-1 text-muted-foreground">Anything that needs doing this week.</p>

      {/* Create new list */}
      <form onSubmit={createList} className="mt-8 flex max-w-md gap-2">
        <Input placeholder="New list name…" value={newListName} onChange={(e) => setNewListName(e.target.value)} />
        <Button type="submit" variant="warm"><Plus className="mr-1 h-4 w-4" /> List</Button>
      </form>

      {lists.length === 0 ? (
        <Card className="mt-10 border-dashed bg-card/60 p-12 text-center">
          <ListChecks className="mx-auto h-10 w-10 text-primary/70" />
          <p className="mt-3 text-muted-foreground">Create your first list above to get started.</p>
        </Card>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]">

          {/* List sidebar */}
          <aside className="flex flex-row flex-wrap gap-2 lg:flex-col">
            {lists.map((l) => (
              <button key={l.id} onClick={() => setActiveList(l.id)}
                className={`group flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition
                  ${activeList === l.id ? "border-primary bg-primary/10 font-semibold" : "border-border hover:bg-muted"}`}>
                <span className="truncate">{l.name}</span>
                {/* Delete button appears on hover */}
                <Trash2 onClick={(e) => { e.stopPropagation(); deleteList(l.id); }}
                  className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
              </button>
            ))}
          </aside>

          {/* Task area */}
          <div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="warm" className="mb-4"><Plus className="mr-1 h-4 w-4" /> Add task</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New task</DialogTitle></DialogHeader>
                <form onSubmit={createTask} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <Input required value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="What needs to be done?" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Due date</Label>
                      <Input type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Priority</Label>
                      <Select value={taskPriority} onValueChange={setTaskPriority}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter><Button variant="warm" type="submit">Add task</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {tasks.length === 0 ? (
              <Card className="border-dashed bg-card/60 p-8 text-center text-muted-foreground">No tasks here yet — add one above!</Card>
            ) : (
              <div className="space-y-2">
                {tasks.map((t) => (
                  <Card key={t.id} className={`flex items-center gap-3 p-4 ${t.completed ? "opacity-60" : ""}`}>
                    <Checkbox checked={t.completed} onCheckedChange={() => toggleTask(t)} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${t.completed ? "line-through" : ""}`}>{t.title}</p>
                      <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {t.due_date && <span>Due {new Date(t.due_date + "T00:00:00").toLocaleDateString()}</span>}
                        {t.priority !== "normal" && <span className="capitalize">{t.priority} priority</span>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteTask(t.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
