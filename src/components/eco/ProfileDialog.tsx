import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Save, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useEco } from "@/lib/eco/store";

const AVATARS = ["🌱", "🌿", "🌍", "🦊", "🐼", "🌸", "🦋", "🌟", "⚡", "🌊", "🐉", "🦅"];

export function ProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
  const navigate = useNavigate();
  const { updateProfile } = useEco();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState("🌱");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setEmail(u.user.email ?? "");
      const { data: p } = await supabase.from("profiles").select("full_name, avatar, bio").eq("id", u.user.id).maybeSingle();
      if (p) {
        setFullName(p.full_name ?? "");
        setAvatar(p.avatar ?? "🌱");
        setBio(p.bio ?? "");
      }
      setLoading(false);
    })();
  }, [open]);

  const save = async () => {
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setSaving(false); return; }
    const { error } = await supabase.from("profiles").update({ full_name: fullName.trim(), avatar, bio: bio.trim() }).eq("id", u.user.id);
    setSaving(false);
    if (error) return toast.error("Couldn't save", { description: error.message });
    updateProfile({ name: fullName.trim() || "Eco Explorer", avatar });
    toast.success("Profile updated");
    onOpenChange(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    onOpenChange(false);
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-emerald-500/20 bg-gradient-to-br from-slate-950 to-emerald-950/40">
        <DialogHeader>
          <DialogTitle>Account & profile</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-muted-foreground">
              Signed in as <span className="text-foreground">{email}</span>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Avatar</Label>
              <div className="flex flex-wrap gap-1.5">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAvatar(a)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-all ${avatar === a ? "border-emerald-400 bg-emerald-400/15" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="p-name" className="mb-1.5 block text-xs text-muted-foreground">Full name</Label>
              <Input id="p-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-white/5" />
            </div>
            <div>
              <Label htmlFor="p-bio" className="mb-1.5 block text-xs text-muted-foreground">Bio</Label>
              <Textarea id="p-bio" value={bio} onChange={(e) => setBio(e.target.value)} className="bg-white/5" rows={3} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={save} disabled={saving} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Save profile</>}
              </Button>
              <Button onClick={signOut} variant="outline" className="border-white/15 bg-white/5">
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
