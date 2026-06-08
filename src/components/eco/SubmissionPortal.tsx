import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Github, Globe, Linkedin, Trophy } from "lucide-react";
import { toast } from "sonner";

export function SubmissionPortal({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
  const [repo, setRepo] = useState("https://github.com/your-handle/ecopulse-ai");
  const [deploy, setDeploy] = useState("https://ecopulse.lovable.app");
  const [post, setPost] = useState("https://linkedin.com/posts/your-handle/ecopulse-build-journey");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-emerald-500/20 bg-gradient-to-br from-slate-950 to-emerald-950/40">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" /> Submission Metrics Portal
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">PromptWars Challenge 3 · Hackathon submission entries.</p>
        <div className="space-y-4 pt-2">
          <Field icon={<Github className="h-4 w-4" />} label="Public GitHub Repository" value={repo} onChange={setRepo} />
          <Field icon={<Globe className="h-4 w-4" />} label="Live Web Deployment" value={deploy} onChange={setDeploy} />
          <Field icon={<Linkedin className="h-4 w-4" />} label="LinkedIn Build Journey Post" value={post} onChange={setPost} />
        </div>
        <Button
          onClick={() => { toast.success("Submission saved", { description: "Locked in for evaluation." }); onOpenChange(false); }}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
        >
          Save submission
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function Field({ icon, label, value, onChange }: { icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="bg-white/5" />
    </div>
  );
}
