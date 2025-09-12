import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { SidebarNav } from "./SidebarNav";
import { Menu } from "lucide-react";
import { useMobile } from "../hooks/use-mobile";
import { SimpleAnimatedThemeToggle } from "./SimpleAnimatedThemeToggle";
import { GooeyMenu } from "./GooeyMenu";
import { useExamDates } from "../lib/useExamDates";
import { useExams } from "../lib/useExams";

const defaultWaitingTemplate = `Dear tester,\n\nThis is an automated message to confirm that we have received your application for the upcoming OSCE examination scheduled in test at London, England.\n\nAs published on the website at the time of registration opening, we have limited slots for the OSCE, and the slots are allotted on a first come first serve basis.\n\nPlease note that your application will be on the WAITING LIST and will be accommodated only in case there is a dropout.\n\nYou will be notified in 4 to 6 weeks on your registered email ID in case of any drop out, otherwise you will have to apply again for the next subsequent OSCE.\n\nWe wish you the best of luck.\n\nSincerely,\n\nOwais Iqbal\nAdministrative Officer\nMRCGP INT South Asia\n\nNote: This is an auto generated email please do not reply.`;

const defaultCandidateTemplate = `Dear tester,\n\nThis is an automated message to confirm that we have received your application for the upcoming OSCE examination scheduled in test at london, england.\n\nWe will review your submission and let you know on your registered email ID in case of any deficiency in the documents.\n\nYou will receive an OSCE slot confirmation email in two weeks after the registration closing date. Fee submission details will also be mentioned in the same email.\n\nWe wish you the best of luck in the exam.\n\nSincerely,\n\nOwais Iqbal\nAdministrative Officer\nMRCGP [INT] South Asia\n\nNote: This is an auto generated email please do not reply.`;

export function Settings() {
  const { toast } = useToast();

  const [candidateTemplate, setCandidateTemplate] = useState("");
  const [waitingTemplate, setWaitingTemplate] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMobile();
  const { items: examDates, loadState, error, create, remove } = useExamDates();
  const [newExamDate, setNewExamDate] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingDeleteLabel, setPendingDeleteLabel] = useState<string>("");

  // Exams state
  const { items: exams, loadState: examsLoad, error: examsError, create: createExam, update: updateExam, remove: removeExam } = useExams();
  const [newExamName, setNewExamName] = useState("");
  const [newExamDescription, setNewExamDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [examConfirmOpen, setExamConfirmOpen] = useState(false);
  const [pendingExamDeleteId, setPendingExamDeleteId] = useState<string | null>(null);
  const [pendingExamDeleteName, setPendingExamDeleteName] = useState<string>("");

  const handleAddExamDate = async () => {
    if (!newExamDate.trim()) return;
    try {
      const created = await create(newExamDate);
      setNewExamDate("");
      toast({ title: "Added", description: created.label });
    } catch (err: unknown) {
      toast({
        title: "Unable to add",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    setCandidateTemplate(
      localStorage.getItem("settings-candidate-template") || defaultCandidateTemplate,
    );
    setWaitingTemplate(
      localStorage.getItem("settings-waiting-template") || defaultWaitingTemplate,
    );
  }, []);

  const saveTemplates = (type: "candidates" | "waiting") => {
    if (type === "candidates") {
      localStorage.setItem("settings-candidate-template", candidateTemplate);
      toast({ title: "Saved", description: "Candidate template updated." });
    } else {
      localStorage.setItem("settings-waiting-template", waitingTemplate);
      toast({ title: "Saved", description: "Waiting candidate template updated." });
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  return (
    <div className="flex h-screen bg-background transition-all duration-300 ease-in-out">
      <SidebarNav sidebarOpen={sidebarOpen} onClose={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-[#5c347d] text-slate-100 h-16 flex items-center px-4 shadow-md dark:bg-[#3b1f52]">
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mr-2 text-slate-100 hover:bg-slate-700/50 dark:hover:bg-slate-800/50"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <div className="flex-1 flex items-center justify-between">
            <h1 className="text-xl font-bold">Settings</h1>
            <div className="flex items-center space-x-4">
              <GooeyMenu />
              <SimpleAnimatedThemeToggle 
                variant="circle"
                start="top-right"
                className="bg-transparent border border-slate-600 hover:bg-slate-700/50 dark:hover:bg-slate-800/50"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950">
          <div className="container mx-auto px-0 py-0 max-w-5xl">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="candidates">
                  <TabsList>
                    <TabsTrigger value="candidates">Candidates</TabsTrigger>
                    <TabsTrigger value="waiting">Waiting Candidates</TabsTrigger>
                  </TabsList>
                  <TabsContent value="candidates" className="mt-4">
                    <div className="space-y-3">
                      <textarea
                        value={candidateTemplate}
                        onChange={(e) => setCandidateTemplate(e.target.value)}
                        className="w-full h-80 p-3 rounded-md border bg-white dark:bg-slate-900"
                      />
                      <div className="flex justify-end">
                        <Button onClick={() => saveTemplates("candidates")}>Submit</Button>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="waiting" className="mt-4">
                    <div className="space-y-3">
                      <textarea
                        value={waitingTemplate}
                        onChange={(e) => setWaitingTemplate(e.target.value)}
                        className="w-full h-80 p-3 rounded-md border bg-white dark:bg-slate-900"
                      />
                      <div className="flex justify-end">
                        <Button onClick={() => saveTemplates("waiting")}>Submit</Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-semibold">Exam Dates</h3>
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="e.g., AKT - November 2019"
                      value={newExamDate}
                      onChange={(e) => setNewExamDate(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          await handleAddExamDate();
                        }
                      }}
                    />
                    <Button
                      onClick={handleAddExamDate}
                      disabled={!newExamDate.trim()}
                    >
                      Add
                    </Button>
                  </div>

                  {loadState === "loading" && (
                    <div className="text-sm text-muted-foreground">Loading exam dates…</div>
                  )}
                  {error && (
                    <div className="text-sm text-red-600">{error}</div>
                  )}

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60%]">Label</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {examDates.map((opt) => (
                          <TableRow key={opt.id}>
                            <TableCell>{opt.label}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setPendingDeleteId(opt.id);
                                  setPendingDeleteLabel(opt.label);
                                  setConfirmOpen(true);
                                }}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {examDates.length === 0 && loadState === "success" && (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-sm text-muted-foreground">
                              No exam dates yet. Add one above.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete exam date?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. We will remove "{pendingDeleteLabel}" from the list.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => {
                        setConfirmOpen(false);
                        setPendingDeleteId(null);
                      }}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={async () => {
                          if (!pendingDeleteId) return;
                          await remove(pendingDeleteId);
                          toast({ title: "Deleted", description: pendingDeleteLabel });
                          setConfirmOpen(false);
                          setPendingDeleteId(null);
                          setPendingDeleteLabel("");
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <div className="mt-10 space-y-4">
                  <h3 className="text-lg font-semibold">Exams</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-start">
                    <Input
                      placeholder="Name (e.g., OSCE)"
                      value={newExamName}
                      onChange={(e) => setNewExamName(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (!newExamName.trim()) return;
                          try {
                            const created = await createExam(newExamName, newExamDescription);
                            toast({ title: "Exam added", description: created.name });
                            setNewExamName("");
                            setNewExamDescription("");
                          } catch (err: unknown) {
                            toast({
                              title: "Unable to add exam",
                              description: err instanceof Error ? err.message : "Unknown error",
                              variant: "destructive",
                            });
                          }
                        }
                      }}
                    />
                    <Textarea
                      placeholder="Description"
                      value={newExamDescription}
                      onChange={(e) => setNewExamDescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <Button
                      onClick={async () => {
                        if (!newExamName.trim()) return;
                        try {
                          const created = await createExam(newExamName, newExamDescription);
                          toast({ title: "Exam added", description: created.name });
                          setNewExamName("");
                          setNewExamDescription("");
                        } catch (err: unknown) {
                          toast({
                            title: "Unable to add exam",
                            description: err instanceof Error ? err.message : "Unknown error",
                            variant: "destructive",
                          });
                        }
                      }}
                      disabled={!newExamName.trim()}
                    >
                      Add Exam
                    </Button>
                  </div>

                  {examsLoad === "loading" && (
                    <div className="text-sm text-muted-foreground">Loading exams…</div>
                  )}
                  {examsError && (
                    <div className="text-sm text-red-600">{examsError}</div>
                  )}

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[20%]">Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {exams.map((exam) => (
                          <TableRow key={exam.id}>
                            <TableCell className="align-top">
                              {editingId === exam.id ? (
                                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                              ) : (
                                exam.name
                              )}
                            </TableCell>
                            <TableCell>
                              {editingId === exam.id ? (
                                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                              ) : (
                                <div className="whitespace-pre-wrap">{exam.description}</div>
                              )}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              {editingId === exam.id ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={async () => {
                                      try {
                                        const updated = await updateExam(exam.id, { name: editName, description: editDescription });
                                        toast({ title: "Exam updated", description: updated.name });
                                        setEditingId(null);
                                      } catch (err: unknown) {
                                        toast({
                                          title: "Unable to update",
                                          description: err instanceof Error ? err.message : "Unknown error",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                      setEditingId(null);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => {
                                      setEditingId(exam.id);
                                      setEditName(exam.name);
                                      setEditDescription(exam.description);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      setPendingExamDeleteId(exam.id);
                                      setPendingExamDeleteName(exam.name);
                                      setExamConfirmOpen(true);
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {exams.length === 0 && examsLoad === "success" && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                              No exams yet. Add one above.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <AlertDialog open={examConfirmOpen} onOpenChange={setExamConfirmOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete exam?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove "{pendingExamDeleteName}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => {
                        setExamConfirmOpen(false);
                        setPendingExamDeleteId(null);
                      }}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={async () => {
                          if (!pendingExamDeleteId) return;
                          await removeExam(pendingExamDeleteId);
                          toast({ title: "Deleted", description: pendingExamDeleteName });
                          setExamConfirmOpen(false);
                          setPendingExamDeleteId(null);
                          setPendingExamDeleteName("");
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Settings;


