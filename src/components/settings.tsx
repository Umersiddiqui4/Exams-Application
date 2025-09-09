import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { SidebarNav } from "./SidebarNav";
import { Menu } from "lucide-react";
import { useMobile } from "../hooks/use-mobile";
import { SimpleAnimatedThemeToggle } from "./SimpleAnimatedThemeToggle";
import { GooeyMenu } from "./GooeyMenu";

const defaultWaitingTemplate = `Dear tester,\n\nThis is an automated message to confirm that we have received your application for the upcoming OSCE examination scheduled in test at London, England.\n\nAs published on the website at the time of registration opening, we have limited slots for the OSCE, and the slots are allotted on a first come first serve basis.\n\nPlease note that your application will be on the WAITING LIST and will be accommodated only in case there is a dropout.\n\nYou will be notified in 4 to 6 weeks on your registered email ID in case of any drop out, otherwise you will have to apply again for the next subsequent OSCE.\n\nWe wish you the best of luck.\n\nSincerely,\n\nOwais Iqbal\nAdministrative Officer\nMRCGP INT South Asia\n\nNote: This is an auto generated email please do not reply.`;

const defaultCandidateTemplate = `Dear tester,\n\nThis is an automated message to confirm that we have received your application for the upcoming OSCE examination scheduled in test at london, england.\n\nWe will review your submission and let you know on your registered email ID in case of any deficiency in the documents.\n\nYou will receive an OSCE slot confirmation email in two weeks after the registration closing date. Fee submission details will also be mentioned in the same email.\n\nWe wish you the best of luck in the exam.\n\nSincerely,\n\nOwais Iqbal\nAdministrative Officer\nMRCGP [INT] South Asia\n\nNote: This is an auto generated email please do not reply.`;

export function Settings() {
  const { toast } = useToast();

  const [candidateTemplate, setCandidateTemplate] = useState("");
  const [waitingTemplate, setWaitingTemplate] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMobile();

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
                <CardTitle className="text-xl">Email Templates</CardTitle>
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
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Settings;


