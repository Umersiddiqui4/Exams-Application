import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
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
import { useAktPastExams } from "../lib/useAktPastExams";
import { useExams } from "../lib/useExams";
import { useLocation } from "react-router-dom";
import { useEmailTemplates } from "../lib/useEmailTemplates";

type CandidateTemplate = {
  type: string;
  subject: string;
  content: string;
  isActive: boolean;
  description: string;
};

const defaultWaitingTemplate: CandidateTemplate = {
  type: "WAITING_LIST_ACKNOWLEDGMENT",
  subject: "Waiting List - {examName}",
  content:
    "<h2>Dear tester,</h2>\n<p>This is an automated message to confirm that we have received your application for the upcoming <strong>OSCE examination</strong> scheduled in <em>test at London, England</em>.</p>\n\n\n<p>As published on the website at the time of registration opening, we have limited slots for the OSCE, and the slots are allotted on a <strong>first come, first serve</strong> basis.</p>\n\n\n<p><strong>Please note:</strong> your application will be on the <strong>WAITING LIST</strong> and will be accommodated only in case there is a dropout.</p>\n\n\n<p>You will be notified in <strong>4 to 6 weeks</strong> on your registered email ID in case of any drop out; otherwise you will have to apply again for the next subsequent OSCE.</p>\n\n\n<p>We wish you the best of luck.</p>\n\n\n<p>Sincerely,<br>\n<strong>Owais Iqbal</strong><br>\nAdministrative Officer<br>\nMRCGP [INT] South Asia</p>\n\n\n<p style=\"color:#d00;font-size:0.9em\"><strong>Note:</strong> This is an auto generated email — please do not reply.</p>",
  isActive: true,
  description: "Template sent when candidate is placed on the waiting list",
};

const defaultCandidateTemplate: CandidateTemplate = {
  type: "APPLICATION_ACKNOWLEDGMENT",
  subject: "Application Received - {examName}",
  content:
    "<h1>Application Received</h1><p>Dear {userName}, your application for {examName} has been received.</p>",
  isActive: true,
  description: "Template sent when an application is received",
};

export function Settings() {
  const { toast } = useToast();
  const location = useLocation();

  const [candidateTemplate, setCandidateTemplate] = useState<CandidateTemplate>(defaultCandidateTemplate);
  const [waitingTemplate, setWaitingTemplate] = useState<CandidateTemplate>(defaultWaitingTemplate);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMobile();
  const { items: examDates, loadState, error, create, remove } = useAktPastExams();
  const [newExamDate, setNewExamDate] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingDeleteLabel, setPendingDeleteLabel] = useState<string>("");
console.log("examDates", examDates);

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

  // Determine which section to show based on URL hash
  const activeSection = useMemo(() => {
    const raw = (location.hash || "#candidates").replace("#", "");
    if (["candidates", "waiting", "exam-dates", "exams"].includes(raw)) {
      return raw as "candidates" | "waiting" | "exam-dates" | "exams";
    }
    return "candidates";
  }, [location.hash]);

  // Email templates (API-backed)
  const { items: emailTemplates, create: createEmailTemplate, update: updateEmailTemplate } = useEmailTemplates();
  const [candidateTemplateId, setCandidateTemplateId] = useState<string | null>(null);
  const [waitingTemplateId, setWaitingTemplateId] = useState<string | null>(null);

  useEffect(() => {
    const cand = emailTemplates.find((t) => t.type === defaultCandidateTemplate.type);
    const wait = emailTemplates.find((t) => t.type === defaultWaitingTemplate.type);
    if (cand) {
      setCandidateTemplateId(cand.id);
      setCandidateTemplate({
        type: cand.type,
        subject: cand.subject,
        content: cand.content,
        isActive: cand.isActive,
        description: cand.description,
      });
    }
    if (wait) {
      setWaitingTemplateId(wait.id);
      setWaitingTemplate({
        type: wait.type,
        subject: wait.subject,
        content: wait.content,
        isActive: wait.isActive,
        description: wait.description,
      });
    }
  }, [emailTemplates]);

  const handleAddExamDate = async () => {
    if (!newExamDate.trim()) return;
    try {
      const created: any = await create(newExamDate);
      console.log("created", created);
      setNewExamDate("");
      toast({ title: "Added", description: created.message });
    } catch (err: unknown) {
      toast({
        title: "Unable to add",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("settings-candidate-template");
      if (raw) {
        const parsed = JSON.parse(raw) as CandidateTemplate;
        setCandidateTemplate({ ...defaultCandidateTemplate, ...parsed });
      } else {
        setCandidateTemplate(defaultCandidateTemplate);
      }
    } catch {
      setCandidateTemplate(defaultCandidateTemplate);
    }
    try {
      const rawWaiting = localStorage.getItem("settings-waiting-template");
      if (rawWaiting) {
        const parsedW = JSON.parse(rawWaiting) as CandidateTemplate;
        setWaitingTemplate({ ...defaultWaitingTemplate, ...parsedW });
      } else {
        setWaitingTemplate(defaultWaitingTemplate);
      }
    } catch {
      setWaitingTemplate(defaultWaitingTemplate);
    }
  }, []);

  const saveTemplates = async (type: "candidates" | "waiting") => {
    try {
      if (type === "candidates") {
        if (candidateTemplateId) {
          const updated = await updateEmailTemplate(candidateTemplateId, candidateTemplate);
          setCandidateTemplateId(updated.id);
        } else {
          const created = await createEmailTemplate(candidateTemplate);
          setCandidateTemplateId(created.id);
        }
        localStorage.setItem("settings-candidate-template", JSON.stringify(candidateTemplate));
        toast({ title: "Saved", description: "Candidate template updated." });
      } else {
        if (waitingTemplateId) {
          const updated = await updateEmailTemplate(waitingTemplateId, waitingTemplate);
          setWaitingTemplateId(updated.id);
        } else {
          const created = await createEmailTemplate(waitingTemplate);
          setWaitingTemplateId(created.id);
        }
        localStorage.setItem("settings-waiting-template", JSON.stringify(waitingTemplate));
        toast({ title: "Saved", description: "Waiting candidate template updated." });
      }
    } catch (err: unknown) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Unable to save template", variant: "destructive" });
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
                <CardTitle className="text-2xl md:text-3xl">Settings</CardTitle>
              </CardHeader>
              <CardContent>
                {(activeSection === "candidates" || activeSection === "waiting") && (
                  <Tabs defaultValue={activeSection}>
                    <TabsList>
                      <TabsTrigger value="candidates" id="candidates">Candidates</TabsTrigger>
                      <TabsTrigger value="waiting" id="waiting">Waiting Candidates</TabsTrigger>
                    </TabsList>
                    <TabsContent value="candidates" className="mt-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Type</label>
                          <Input
                            value={candidateTemplate.type}
                            onChange={(e) => setCandidateTemplate({ ...candidateTemplate, type: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Subject</label>
                          <Input
                            value={candidateTemplate.subject}
                            onChange={(e) => setCandidateTemplate({ ...candidateTemplate, subject: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Content</label>
                        <RichTextEditor
                          value={candidateTemplate.content}
                          onChange={(html) => setCandidateTemplate({ ...candidateTemplate, content: html })}
                          className="bg-white dark:bg-slate-900 rounded-md"
                          placeholder="Write email content..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <Textarea
                          value={candidateTemplate.description}
                          onChange={(e) => setCandidateTemplate({ ...candidateTemplate, description: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={candidateTemplate.isActive}
                          onCheckedChange={(v) => setCandidateTemplate({ ...candidateTemplate, isActive: Boolean(v) })}
                        />
                        <span className="text-sm">Active</span>
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={() => saveTemplates("candidates")}>Save</Button>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="waiting" className="mt-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Type</label>
                          <Input
                            value={waitingTemplate.type}
                            onChange={(e) => setWaitingTemplate({ ...waitingTemplate, type: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Subject</label>
                          <Input
                            value={waitingTemplate.subject}
                            onChange={(e) => setWaitingTemplate({ ...waitingTemplate, subject: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Content</label>
                        <RichTextEditor
                          value={waitingTemplate.content}
                          onChange={(html) => setWaitingTemplate({ ...waitingTemplate, content: html })}
                          className="bg-white dark:bg-slate-900 rounded-md"
                          placeholder="Write email content..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <Textarea
                          value={waitingTemplate.description}
                          onChange={(e) => setWaitingTemplate({ ...waitingTemplate, description: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={waitingTemplate.isActive}
                          onCheckedChange={(v) => setWaitingTemplate({ ...waitingTemplate, isActive: Boolean(v) })}
                        />
                        <span className="text-sm">Active</span>
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={() => saveTemplates("waiting")}>Save</Button>
                      </div>
                    </div>
                  </TabsContent>
                  </Tabs>
                )}

                {activeSection === "exam-dates" && (
                <div className="mt-8 space-y-4" id="exam-dates">
                  <h3 className="text-xl md:text-2xl font-semibold">Exam Dates</h3>
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
                            <TableCell>{opt.name}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setPendingDeleteId(opt.id);
                                  setPendingDeleteLabel(opt.name);
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
                )}

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

                {activeSection === "exams" && (
                <div className="mt-10 space-y-4" id="exams">
                  <h3 className="text-xl md:text-2xl font-semibold">Exams</h3>
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
                )}

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


