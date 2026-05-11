"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Baby, Bell, Lock, Cloud, Users, Palette, Globe, 
  Cpu, BarChart, Heart, HelpCircle, Save, ChevronRight,
  Camera, Mail, Shield, Download, Trash2, Moon, Sun, 
  CheckCircle2, AlertCircle, Phone, Fingerprint, Plus,
  X, Video, Image as ImageIcon, Music, Copy
} from "lucide-react";
import { useSession } from "next-auth/react";
import BlurText from "@/components/BlurText";

const sections = [
  { id: "account", label: "Account Settings", icon: User, color: "text-blue-500" },
  { id: "baby", label: "Baby Profile", icon: Baby, color: "text-ruby-rose" },
  { id: "notifications", label: "Notifications", icon: Bell, color: "text-amber-500" },
  { id: "privacy", label: "Privacy & Security", icon: Lock, color: "text-emerald" },
  { id: "backup", label: "Backup & Storage", icon: Cloud, color: "text-cyan-500" },
  { id: "family", label: "Family Access", icon: Users, color: "text-indigo-500" },
  { id: "appearance", label: "Appearance", icon: Palette, color: "text-purple-500" },
  { id: "preferences", label: "App Preferences", icon: Globe, color: "text-slate-500" },
  { id: "ai", label: "AI Settings", icon: Cpu, color: "text-pink-500" },
  { id: "data", label: "Data & Reports", icon: BarChart, color: "text-orange-500" },
  { id: "emotional", label: "Emotional Features", icon: Heart, color: "text-red-500" },
  { id: "support", label: "Support & Help", icon: HelpCircle, color: "text-zinc-500" },
];

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [activeSection, setActiveSection] = useState("account");
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [accountData, setAccountData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: (session?.user as any)?.phone || "",
    language: (session?.user as any)?.language || "English (US)",
    currentPassword: "",
    newPassword: "",
    profileImage: session?.user?.image || ""
  });

  const [babyInfo, setBabyInfo] = useState({
    name: (session?.user as any)?.baby?.name || "",
    dob: (session?.user as any)?.baby?.dob || "",
    gender: (session?.user as any)?.baby?.gender || "Female",
    bloodGroup: (session?.user as any)?.baby?.bloodGroup || "",
    weight: (session?.user as any)?.baby?.weight || "",
    height: (session?.user as any)?.baby?.height || ""
  });

  const [appSettings, setAppSettings] = useState({
    notifications: (session?.user as any)?.settings?.notifications || { vaccine: true, growth: true, memory: true, birthday: true, feeding: false, sleep: false, email: true, push: true },
    privacy: (session?.user as any)?.settings?.privacy || { private: true, familyOnly: true, tfa: false, biometric: true },
    backup: (session?.user as any)?.settings?.backup || { auto: true },
    family: (session?.user as any)?.settings?.family || { grandparent: false, shared: true },
    appearance: (session?.user as any)?.settings?.appearance || { theme: "light" },
    preferences: (session?.user as any)?.settings?.preferences || { kg: true, cm: true },
    ai: (session?.user as any)?.settings?.ai || { insights: true, suggestions: true, caption: false, summary: true },
    emotional: (session?.user as any)?.settings?.emotional || { today: true, anniv: true, growth: true, recap: true }
  });

  const updateAppSetting = (section: keyof typeof appSettings, newValues: any) => {
    setAppSettings(prev => ({ ...prev, [section]: newValues }));
  };

  // Update logic to fill data when session loads
  useEffect(() => {
    if (session?.user) {
      setAccountData(prev => ({
        ...prev,
        name: session.user?.name || prev.name,
        email: session.user?.email || prev.email,
        profileImage: session.user?.image || prev.profileImage,
        phone: (session.user as any)?.phone || prev.phone,
        language: (session.user as any)?.language || prev.language
      }));
      
      const sessionBaby = (session.user as any)?.baby;
      if (sessionBaby) {
        setBabyInfo(prev => ({
          ...prev,
          name: sessionBaby.name || prev.name,
          dob: sessionBaby.dob || prev.dob,
          gender: sessionBaby.gender || prev.gender,
          bloodGroup: sessionBaby.bloodGroup || prev.bloodGroup,
          weight: sessionBaby.weight || prev.weight,
          height: sessionBaby.height || prev.height
        }));
      }

      const sessionSettings = (session.user as any)?.settings;
      if (sessionSettings) {
        setAppSettings(prev => ({
          ...prev,
          ...sessionSettings
        }));
      }
    }
  }, [session]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAccountData({ ...accountData, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (activeSection === "account") {
        console.log("Saving account data...");
        
        // Use FormData for profile updates to avoid JSON payload size limits
        // and improve network reliability with large images
        const formData = new FormData();
        formData.append('name', accountData.name);
        formData.append('email', accountData.email);
        formData.append('phone', accountData.phone);
        formData.append('language', accountData.language);
        if (accountData.profileImage) {
          formData.append('profileImage', accountData.profileImage);
        }
        if (accountData.newPassword) {
          formData.append('currentPassword', accountData.currentPassword);
          formData.append('newPassword', accountData.newPassword);
        }

        const res = await fetch("/api/user/update", {
          method: "PATCH",
          body: formData // Change to FormData
        });
        
        let result;
        try {
          result = await res.json();
        } catch (e) {
          result = { error: "Failed to parse server response" };
        }

        console.log("Update response:", result);

        if (res.ok) {
          // Update the session token with new data
          // Create session update object without large base64 images
          // NextAuth JWT cookies crash if they exceed the 4KB limit
          const updatedSessionData: any = {
            name: accountData.name,
            phone: accountData.phone,
            language: accountData.language
          };
          
          // Only update image in session if it's a URL, not a massive base64 string
          if (accountData.profileImage && !accountData.profileImage.startsWith('data:image')) {
            updatedSessionData.image = accountData.profileImage;
          }

          await updateSession({
            user: {
              ...session?.user,
              ...updatedSessionData
            }
          });
          alert("✅ Profile updated successfully!");
        } else {
          const errorMessage = result.error || result.message || "Could not save settings";
          alert(`❌ Server Error: ${errorMessage}`);
        }
      } else if (activeSection === "baby") {
        console.log("Saving baby data...");
        const res = await fetch("/api/user/update", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ baby: babyInfo })
        });
        
        if (res.ok) {
          await updateSession();
          alert("✅ Baby Profile updated successfully!");
        } else {
          const result = await res.json();
          alert(`❌ Server Error: ${result.error || "Could not save baby settings"}`);
        }
      } else {
        console.log(`Saving ${activeSection} data...`);
        const res = await fetch("/api/user/update", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
             settings: { 
                 [activeSection]: appSettings[activeSection as keyof typeof appSettings] 
             } 
          })
        });
        
        if (res.ok) {
          await updateSession();
          alert(`✅ ${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Settings updated successfully!`);
        } else {
          const result = await res.json();
          alert(`❌ Server Error: ${result.error || "Could not save settings"}`);
        }
      }
    } catch (error: any) {
      console.error("Save error:", error);
      alert(`❌ Connection Error: ${error.message || "Failed to reach server"}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      className="pb-24 max-w-7xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="mb-12">
        <BlurText
          text="System Settings"
          delay={150}
          animateBy="words"
          direction="top"
          className="text-5xl md:text-7xl font-heading font-black tracking-tighter font-attract text-gradient mb-4"
        />
        <p className="text-muted text-xl font-medium tracking-tight border-l-4 border-royal-gold pl-4">
          Customize your sanctuary. <span className="text-emerald font-bold">Your rules, your memories.</span>
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:w-80 space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-black uppercase tracking-widest text-xs border cursor-pointer ${
                activeSection === section.id 
                  ? "bg-gradient-to-r from-royal-gold to-emerald text-black border-transparent shadow-lg scale-105" 
                  : "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl hover:bg-white dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-white/40 dark:border-zinc-700/50 shadow-md"
              }`}
            >
              <section.icon className={`w-5 h-5 ${activeSection === section.id ? "text-black" : section.color}`} />
              {section.label}
              {activeSection === section.id && <ChevronRight className="ml-auto w-4 h-4" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 glass-card p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden bg-white/70 dark:bg-zinc-900/60 transition-all min-h-[700px]">
           <div className="absolute top-0 right-0 w-64 h-64 bg-royal-gold/5 blur-[100px] pointer-events-none rounded-full" />
           
           <AnimatePresence mode="wait">
             <motion.div
               key={activeSection}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-10"
             >
               {/* Content Dynamic Rendering */}
               {activeSection === "account" && <AccountSettings session={session} data={accountData} setData={setAccountData} onImageUpload={handleImageUpload} />}
               {activeSection === "baby" && <BabyProfileSettings data={babyInfo} setData={setBabyInfo} />}
               {activeSection === "notifications" && <NotificationSettings data={appSettings.notifications} setData={(v: any) => updateAppSetting("notifications", v)} />}
               {activeSection === "privacy" && <PrivacySettings data={appSettings.privacy} setData={(v: any) => updateAppSetting("privacy", v)} />}
               {activeSection === "backup" && <BackupSettings data={appSettings.backup} setData={(v: any) => updateAppSetting("backup", v)} />}
               {activeSection === "family" && <FamilyAccessSettings data={appSettings.family} setData={(v: any) => updateAppSetting("family", v)} />}
               {activeSection === "appearance" && <AppearanceSettings data={appSettings.appearance} setData={(v: any) => updateAppSetting("appearance", v)} />}
               {activeSection === "preferences" && <AppPreferences data={appSettings.preferences} setData={(v: any) => updateAppSetting("preferences", v)} />}
               {activeSection === "ai" && <AISettings data={appSettings.ai} setData={(v: any) => updateAppSetting("ai", v)} />}
               {activeSection === "data" && <DataSettings />}
               {activeSection === "emotional" && <EmotionalFeatures data={appSettings.emotional} setData={(v: any) => updateAppSetting("emotional", v)} />}
               {activeSection === "support" && <SupportSettings />}
             </motion.div>
           </AnimatePresence>

           <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
             <button 
               onClick={handleSave}
               disabled={isSaving}
               className="btn-crystal px-12 py-4 rounded-2xl font-black text-lg flex items-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
             >
               {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-6 h-6 text-emerald" /> Save Changes</>}
             </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Subcomponents for each section ---

function Loader2({ className }: { className?: string }) {
  return <Cpu className={`${className} animate-spin`} />;
}

function SectionHeading({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-heading font-black font-attract tracking-tighter mb-2">{title}</h2>
      <p className="text-muted font-medium italic">{subtitle}</p>
    </div>
  );
}

function InputField({ label, placeholder, type = "text", value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 dark:text-zinc-300 ml-2">{label}</label>
      <input 
        type={type} 
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-white/40 dark:border-zinc-700/50 focus:border-royal-gold rounded-2xl px-6 py-4 outline-none transition-all placeholder:text-zinc-400 font-bold text-zinc-900 dark:text-zinc-100 shadow-inner"
      />
    </div>
  );
}

function ToggleField({ label, description, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between p-6 rounded-[2rem] bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl hover:bg-white/90 dark:hover:bg-zinc-800/90 transition-all border border-white/40 dark:border-zinc-700/50 shadow-md">
      <div className="pr-10">
        <h4 className="font-black uppercase tracking-widest text-xs mb-1 text-zinc-900 dark:text-white">{label}</h4>
        <p className="text-zinc-600 dark:text-zinc-300 text-[10px] font-medium leading-relaxed">{description}</p>
      </div>
      <button 
        onClick={() => onChange(!checked)}
        className={`w-14 h-8 shrink-0 rounded-full relative transition-colors duration-300 shadow-inner cursor-pointer ${checked ? "bg-emerald" : "bg-zinc-300 dark:bg-zinc-700"}`}
      >
        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${checked ? "left-7" : "left-1"}`} />
      </button>
    </div>
  );
}

function AccountSettings({ session, data, setData, onImageUpload }: any) {
  return (
    <div>
      <SectionHeading title="👤 Account Settings" subtitle="Keep your personal vault credentials updated." />
      <div className="flex flex-col md:flex-row items-center gap-10 mb-10 pb-10 border-b border-dashed border-zinc-200 dark:border-zinc-800">
        <div className="relative group">
          <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-blue-500 to-indigo-500 p-1">
             <img 
               src={data.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.user?.name || "User")}&background=fff&color=000&bold=true&size=200`} 
               className="w-full h-full rounded-[2.2rem] object-cover" 
               alt="Profile"
             />
          </div>
          <label className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl hover:scale-110 transition-transform group-hover:rotate-12 cursor-pointer">
            <Camera className="w-5 h-5 text-blue-500" />
            <input type="file" className="hidden" accept="image/*" onChange={onImageUpload} />
          </label>
        </div>
        <div className="flex-1 w-full grid md:grid-cols-2 gap-6">
          <InputField 
            label="Parent Name" 
            value={data.name} 
            onChange={(e: any) => setData({...data, name: e.target.value})} 
          />
          <InputField 
            label="Email Address" 
            value={data.email} 
            onChange={(e: any) => setData({...data, email: e.target.value})} 
          />
          <InputField 
            label="Phone Number" 
            value={data.phone} 
            placeholder="+1 (555) 000-0000" 
            onChange={(e: any) => setData({...data, phone: e.target.value})}
          />
          <InputField 
            label="Preferred Language" 
            value={data.language || "English (US)"} 
            onChange={(e: any) => setData({...data, language: e.target.value})}
          />
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <InputField 
            label="Current Password" 
            type="password" 
            value={data.currentPassword}
            placeholder="Required for update" 
            onChange={(e: any) => setData({...data, currentPassword: e.target.value})}
        />
        <InputField 
            label="New Password" 
            type="password" 
            value={data.newPassword}
            placeholder="Leave blank to keep" 
            onChange={(e: any) => setData({...data, newPassword: e.target.value})}
        />
        <InputField 
            label="Confirm Password" 
            type="password" 
            placeholder="••••••••" 
        />
      </div>
    </div>
  );
}

function BabyProfileSettings({ data: babyInfo, setData: setBabyInfo }: any) {
  return (
    <div>
      <SectionHeading title="👶 Baby Profile Settings" subtitle="Manage the precious details of your little one." />
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <InputField 
            label="Baby Name" 
            value={babyInfo.name} 
            onChange={(e: any) => setBabyInfo({...babyInfo, name: e.target.value})}
        />
        <InputField 
            label="Date of Birth" 
            type="date" 
            value={babyInfo.dob} 
            onChange={(e: any) => setBabyInfo({...babyInfo, dob: e.target.value})}
        />
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted ml-2">Gender</label>
            <select 
                value={babyInfo.gender}
                onChange={(e) => setBabyInfo({...babyInfo, gender: e.target.value})}
                className="w-full bg-white/50 dark:bg-black/30 border-2 border-transparent focus:border-royal-gold rounded-2xl px-6 py-4 outline-none transition-all font-bold appearance-none"
            >
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
            </select>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
            <InputField 
                label="Blood Group" 
                value={babyInfo.bloodGroup} 
                onChange={(e: any) => setBabyInfo({...babyInfo, bloodGroup: e.target.value})}
            />
            <InputField 
                label="Birth Weight (KG)" 
                value={babyInfo.weight} 
                onChange={(e: any) => setBabyInfo({...babyInfo, weight: e.target.value})}
            />
            <InputField 
                label="Birth Height (CM)" 
                value={babyInfo.height} 
                onChange={(e: any) => setBabyInfo({...babyInfo, height: e.target.value})}
            />
        </div>
        <div className="glass-card p-6 flex flex-col items-center justify-center border-dashed bg-white/20">
            <div className="w-40 h-40 bg-zinc-100 dark:bg-zinc-800 rounded-[3rem] border-2 border-dashed border-zinc-300 flex items-center justify-center mb-4 group cursor-pointer hover:border-ruby-rose transition-colors">
                <Plus className="w-10 h-10 text-zinc-300 group-hover:text-ruby-rose" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Add Another Profile</p>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings({ data: notifs, setData: setNotifs }: any) {
  return (
    <div>
      <SectionHeading title="🔔 Notification Settings" subtitle="Stay informed about every milestone and reminder." />
      <div className="grid md:grid-cols-2 gap-6">
        <ToggleField label="Vaccine Reminders" description="Upcoming health visits and shots." checked={notifs.vaccine} onChange={(v: boolean) => setNotifs({...notifs, vaccine: v})} />
        <ToggleField label="Growth Updates" description="Weekly milestones for your baby's age." checked={notifs.growth} onChange={(v: boolean) => setNotifs({...notifs, growth: v})} />
        <ToggleField label="Memory Alerts" description="Reminders to capture special moments." checked={notifs.memory} onChange={(v: boolean) => setNotifs({...notifs, memory: v})} />
        <ToggleField label="Birthday Events" description="Countdowns and anniversary alerts." checked={notifs.birthday} onChange={(v: boolean) => setNotifs({...notifs, birthday: v})} />
        <ToggleField label="Feeding Reminders" description="Helpful nudge for feeding schedules." checked={notifs.feeding} onChange={(v: boolean) => setNotifs({...notifs, feeding: v})} />
        <ToggleField label="Sleep Tracking" description="Notifications for bedtime routines." checked={notifs.sleep} onChange={(v: boolean) => setNotifs({...notifs, sleep: v})} />
        <ToggleField label="Email Digest" description="Monthly summary of your memories." checked={notifs.email} onChange={(v: boolean) => setNotifs({...notifs, email: v})} />
        <ToggleField label="Push Notifications" description="Real-time alerts on your device." checked={notifs.push} onChange={(v: boolean) => setNotifs({...notifs, push: v})} />
      </div>
    </div>
  );
}

function PrivacySettings({ data: privacy, setData: setPrivacy }: any) {
  return (
    <div>
      <SectionHeading title="🔒 Privacy & Security" subtitle="Your family's safety is our highest priority." />
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <ToggleField label="Private Account" description="Make your vault completely invisible." checked={privacy.private} onChange={(v: boolean) => setPrivacy({...privacy, private: v})} />
        <ToggleField label="Family-Only" description="Restrict access to invited members only." checked={privacy.familyOnly} onChange={(v: boolean) => setPrivacy({...privacy, familyOnly: v})} />
        <ToggleField label="Two-Factor (2FA)" description="Double your login security layer." checked={privacy.tfa} onChange={(v: boolean) => setPrivacy({...privacy, tfa: v})} />
        <ToggleField label="Biometric Access" description="Unlock with FaceID or Fingerprint." checked={privacy.biometric} onChange={(v: boolean) => setPrivacy({...privacy, biometric: v})} />
      </div>
      <div className="space-y-4">
        <h4 className="font-black uppercase tracking-widest text-xs ml-4 mb-4">Device Management</h4>
        <div className="glass-card p-6 rounded-[2rem] bg-emerald/5 border-emerald/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Shield className="w-8 h-8 text-emerald" />
                <div>
                   <p className="font-black text-sm">Windows PC • Chrome</p>
                   <p className="text-[10px] text-emerald font-bold">Current Active Session</p>
                </div>
            </div>
            <button className="text-ruby-rose text-[10px] font-black uppercase tracking-widest hover:underline">Revoke Access</button>
        </div>
      </div>
    </div>
  );
}

function RecoveryBinModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [items, setItems] = useState([
    { id: 1, name: "First Steps Video.mp4", size: "24 MB", daysLeft: 28, type: "video" },
    { id: 2, name: "Family Picnic.jpg", size: "4.2 MB", daysLeft: 12, type: "image" },
    { id: 3, name: "Voice Memo - First Word.m4a", size: "1.1 MB", daysLeft: 2, type: "audio" }
  ]);

  const handleRestore = (id: number) => {
    setItems(items.filter(item => item.id !== id));
    alert("Item restored successfully!");
  };

  const handleDelete = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-ruby-rose/10 rounded-2xl"><Trash2 className="w-6 h-6 text-ruby-rose" /></div>
            <div>
              <h3 className="font-black text-xl text-zinc-900 dark:text-white">Recovery Bin</h3>
              <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase">Items kept for 30 days.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"><X className="w-6 h-6 text-zinc-900 dark:text-white" /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {items.length === 0 ? (
            <div className="text-center py-10">
              <Trash2 className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
              <p className="font-bold text-zinc-500 uppercase tracking-widest text-sm">Your recovery bin is empty.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-ruby-rose/50 transition-colors bg-white dark:bg-zinc-900 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      {item.type === 'video' ? <Video className="w-6 h-6 text-blue-500" /> : item.type === 'image' ? <ImageIcon className="w-6 h-6 text-emerald" /> : <Music className="w-6 h-6 text-purple-500" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-zinc-900 dark:text-white">{item.name}</p>
                      <p className="text-[10px] text-zinc-500 font-medium">{item.size} • <span className="text-ruby-rose">{item.daysLeft} days left</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleRestore(item.id)} className="px-4 py-2 bg-emerald/10 text-emerald hover:bg-emerald/20 font-black text-[10px] uppercase tracking-widest rounded-xl transition-colors cursor-pointer">Restore</button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-ruby-rose/10 text-ruby-rose hover:bg-ruby-rose/20 rounded-xl transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BackupSettings({ data: backup, setData: setBackup }: any) {
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);

  const handleDownloadAll = () => {
    const content = "Memory Nest Export\n\nYour vault data would be included here. As this is a demonstration environment, no actual photos or videos were zipped. Thank you for using Memory Nest!";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "memory-nest-export.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <RecoveryBinModal isOpen={isRecoveryOpen} onClose={() => setIsRecoveryOpen(false)} />
      <SectionHeading title="☁️ Backup & Storage" subtitle="Never lose a single smile with cloud preservation." />
      <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest">Storage Status: <span className="text-emerald">Premium Unlimited</span></span>
              <span className="text-[10px] font-bold">12.4 GB used</span>
          </div>
          <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="w-[30%] h-full bg-gradient-to-r from-cyan-500 to-blue-500" />
          </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <ToggleField label="Cloud Auto-Backup" description="Sync new memories immediately." checked={backup.auto} onChange={(v: boolean) => setBackup({auto: v})} />
        <button onClick={handleDownloadAll} className="p-6 rounded-[2rem] bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl hover:bg-white/90 dark:hover:bg-zinc-800/90 transition-all border-dashed border-2 border-cyan-500/40 dark:border-cyan-500/30 flex items-center gap-4 shadow-md cursor-pointer group">
            <Download className="w-8 h-8 text-cyan-500 group-hover:scale-110 transition-transform" />
            <div className="text-left">
                <p className="font-black text-xs uppercase tracking-widest text-zinc-900 dark:text-white">Download All</p>
                <p className="text-[10px] text-zinc-600 dark:text-zinc-300">Export your entire vault to ZIP</p>
            </div>
        </button>
        <button onClick={() => setIsRecoveryOpen(true)} className="p-6 rounded-[2rem] bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl hover:bg-white/90 dark:hover:bg-zinc-800/90 transition-all border border-white/40 dark:border-zinc-700/50 flex items-center gap-4 shadow-md cursor-pointer group">
            <Trash2 className="w-8 h-8 text-ruby-rose group-hover:scale-110 transition-transform" />
            <div className="text-left">
                <p className="font-black text-xs uppercase tracking-widest text-zinc-900 dark:text-white">Recovery Bin</p>
                <p className="text-[10px] text-zinc-600 dark:text-zinc-300">Restore memories deleted in last 30 days</p>
            </div>
        </button>
      </div>
    </div>
  );
}

function FamilyAccessSettings({ data: access, setData: setAccess }: any) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    // Generate unique referral link safely on client mount
    const code = Math.random().toString(36).substring(2, 12);
    setInviteLink(`${window.location.origin}/join/${code}`);
  }, []);

  const handleInvite = async () => {
    if (!email) {
      alert("Please enter a valid email address.");
      return;
    }
    
    setIsSending(true);
    try {
      const res = await fetch("/api/family/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, inviteLink })
      });
      
      const result = await res.json();
      if (res.ok) {
        alert(`✅ Success! An email invitation has been securely sent to ${email}`);
        setEmail("");
      } else {
        alert("❌ Error: " + result.error);
      }
    } catch (error) {
      alert("❌ Something went wrong while sending the invite.");
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert("✅ Referral link copied to clipboard!");
  };

  return (
    <div>
      <SectionHeading title="👨‍👩‍👧 Family Access" subtitle="Invite loved ones to share the journey." />
      <div className="p-10 rounded-[3rem] bg-indigo-500/10 dark:bg-indigo-500/5 backdrop-blur-xl border-dashed border-2 border-indigo-500/30 mb-10 text-center shadow-inner relative">
          <Users className="w-16 h-16 text-indigo-500/60 dark:text-indigo-500/40 mx-auto mb-6" />
          <h4 className="text-2xl font-black mb-4 text-zinc-900 dark:text-white">Invite a Protector</h4>
          
          <div className="flex flex-col gap-4 max-w-md mx-auto">
              <div className="flex gap-4">
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email of family member" 
                    className="flex-1 bg-white/80 dark:bg-zinc-900/80 rounded-xl px-6 py-3 outline-none border-2 border-transparent focus:border-indigo-500 text-zinc-900 dark:text-white font-bold shadow-inner placeholder:text-zinc-400" 
                  />
                  <button 
                    onClick={handleInvite}
                    disabled={isSending}
                    className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-28 flex items-center justify-center"
                  >
                    {isSending ? "Sending..." : "Invite"}
                  </button>
              </div>

              <div className="flex items-center gap-4 my-2">
                <div className="h-[1px] flex-1 bg-indigo-500/20"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500/50">OR</span>
                <div className="h-[1px] flex-1 bg-indigo-500/20"></div>
              </div>

              <button 
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-3 bg-white/60 dark:bg-zinc-900/60 hover:bg-white dark:hover:bg-zinc-800 text-indigo-600 dark:text-indigo-400 py-4 rounded-xl border border-indigo-500/30 shadow-sm transition-all font-black text-xs uppercase tracking-widest cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                Copy Referral Link
              </button>
          </div>
      </div>
      <div className="space-y-4">
          <ToggleField label="Grandparent Mode" description="Simplify UI for easier viewing." checked={access.grandparent} onChange={(v: boolean) => setAccess({...access, grandparent: v})} />
          <ToggleField label="Shared Album Access" description="Allow family to upload their own photos." checked={access.shared} onChange={(v: boolean) => setAccess({...access, shared: v})} />
      </div>
    </div>
  );
}

function AppearanceSettings({ data: appearance, setData: setAppearance }: any) {
  const theme = appearance.theme;
  const setTheme = (t: string) => setAppearance({...appearance, theme: t});
  return (
    <div>
      <SectionHeading title="🎨 Appearance Settings" subtitle="Make the workspace feel like home." />
      <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-6">
              <h4 className="font-black uppercase tracking-widest text-xs ml-4">Main Theme</h4>
              <div className="flex gap-4">
                  <button 
                    onClick={() => setTheme("light")}
                    className={`flex-1 p-6 rounded-[2rem] border-2 flex flex-col items-center gap-2 transition-all cursor-pointer bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl ${theme === "light" ? "border-ruby-rose shadow-[0_10px_30px_rgba(255,45,85,0.2)] scale-105" : "border-white/40 dark:border-zinc-700/50 hover:bg-white/90 dark:hover:bg-zinc-800/90"}`}
                  >
                      <Sun className={`w-8 h-8 ${theme === "light" ? "text-ruby-rose" : "text-zinc-400"}`} />
                      <span className={`font-black text-[10px] uppercase ${theme === "light" ? "text-zinc-900 dark:text-white" : "text-zinc-600 dark:text-zinc-400"}`}>Light</span>
                  </button>
                  <button 
                    onClick={() => setTheme("dark")}
                    className={`flex-1 p-6 rounded-[2rem] border-2 flex flex-col items-center gap-2 transition-all cursor-pointer bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl ${theme === "dark" ? "border-ruby-rose shadow-[0_10px_30px_rgba(255,45,85,0.2)] scale-105" : "border-white/40 dark:border-zinc-700/50 hover:bg-white/90 dark:hover:bg-zinc-800/90"}`}
                  >
                      <Moon className={`w-8 h-8 ${theme === "dark" ? "text-ruby-rose" : "text-zinc-400"}`} />
                      <span className={`font-black text-[10px] uppercase ${theme === "dark" ? "text-zinc-900 dark:text-white" : "text-zinc-600 dark:text-zinc-400"}`}>Dark</span>
                  </button>
              </div>
          </div>
          <div className="space-y-6">
              <h4 className="font-black uppercase tracking-widest text-xs ml-4">Accent Colors</h4>
              <div className="flex gap-3 flex-wrap">
                  {["#ff2d55", "#FFD700", "#10b981", "#3b82f6", "#8b5cf6"].map(color => (
                      <div key={color} className="w-10 h-10 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform" style={{ backgroundColor: color }} />
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
}

function AppPreferences({ data: prefs, setData: setPrefs }: any) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
        <InputField label="Date Format" value="DD / MM / YYYY" />
        <InputField label="Time Zone" value="(GMT+05:30) Mumbai, India" />
        <div className="space-y-4 col-span-2">
            <h4 className="font-black uppercase tracking-widest text-xs ml-4">Measurement Units</h4>
            <div className="flex gap-4">
                <ToggleField label="Weight in KG" description="Switch to LB otherwise" checked={prefs.kg} onChange={(v: boolean) => setPrefs({...prefs, kg: v})} />
                <ToggleField label="Height in CM" description="Switch to Inches otherwise" checked={prefs.cm} onChange={(v: boolean) => setPrefs({...prefs, cm: v})} />
            </div>
        </div>
    </div>
  );
}

function AISettings({ data: ai, setData: setAi }: any) {
  return (
    <div>
      <SectionHeading title="🤖 AI Assistant Settings" subtitle="Let our neural engine help organize your life." />
      <div className="grid md:grid-cols-2 gap-6">
        <ToggleField label="Growth Insights" description="AI analysis of growth charts." checked={ai.insights} onChange={(v: boolean) => setAi({...ai, insights: v})} />
        <ToggleField label="Smart Suggestions" description="Tips based on current activities." checked={ai.suggestions} onChange={(v: boolean) => setAi({...ai, suggestions: v})} />
        <ToggleField label="Auto Captioning" description="Generate memory titles from images." checked={ai.caption} onChange={(v: boolean) => setAi({...ai, caption: v})} />
        <ToggleField label="Monthly AI Summary" description="Video montage and written recap." checked={ai.summary} onChange={(v: boolean) => setAi({...ai, summary: v})} />
      </div>
    </div>
  );
}

function DataSettings() {
  return (
    <div>
      <SectionHeading title="📊 Data & Reports" subtitle="Export your child's legacy for the real world." />
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
              { label: "Growth PDF", icon: Download, color: "text-orange-500", bg: "bg-orange-500/10" },
              { label: "Timeline Export", icon: Download, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Charts CSV", icon: Save, color: "text-emerald", bg: "bg-emerald/10" },
              { label: "Memory Book", icon: Heart, color: "text-red-500", bg: "bg-red-500/10" }
          ].map(item => (
              <button key={item.label} onClick={() => alert(`Starting process to generate ${item.label}...`)} className="p-6 rounded-[2rem] flex flex-col items-center gap-4 hover:scale-105 transition-all cursor-pointer bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/40 dark:border-zinc-700/50 shadow-md hover:bg-white/90 dark:hover:bg-zinc-800/90">
                  <div className={`p-4 rounded-2xl ${item.bg}`}><item.icon className={`w-6 h-6 ${item.color}`} /></div>
                  <span className="text-[10px] font-black uppercase text-center text-zinc-900 dark:text-white">{item.label}</span>
              </button>
          ))}
      </div>
    </div>
  );
}

function EmotionalFeatures({ data: emo, setData: setEmo }: any) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
        <ToggleField label="Today's Memory" description="Random throwback to previous year." checked={emo.today} onChange={(v: boolean) => setEmo({...emo, today: v})} />
        <ToggleField label="Anniversaries" description="Every month/year celebrations." checked={emo.anniv} onChange={(v: boolean) => setEmo({...emo, anniv: v})} />
        <ToggleField label="Growth Highlights" description="Notification for major milestones." checked={emo.growth} onChange={(v: boolean) => setEmo({...emo, growth: v})} />
        <ToggleField label="Year Recap" description="A movie of the past 365 days." checked={emo.recap} onChange={(v: boolean) => setEmo({...emo, recap: v})} />
    </div>
  );
}

function SupportSettings() {
  return (
    <div>
      <SectionHeading title="🆘 Help & Support" subtitle="We're here for you and your baby." />
      <div className="grid md:grid-cols-3 gap-6">
          {[
              { label: "Contact Support", icon: Mail },
              { label: "FAQ Center", icon: HelpCircle },
              { label: "Report a Bug", icon: AlertCircle },
              { label: "Feedback", icon: Heart },
              { label: "Tutorials", icon: Globe },
              { label: "System Status", icon: CheckCircle2 }
          ].map(item => (
              <button key={item.label} onClick={() => alert(`Redirecting to ${item.label}...`)} className="p-8 rounded-[2rem] flex flex-col items-center gap-4 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl hover:bg-white/90 dark:hover:bg-zinc-800/90 transition-all group cursor-pointer border border-white/40 dark:border-zinc-700/50 shadow-md">
                  <item.icon className="w-8 h-8 text-zinc-400 group-hover:text-royal-gold transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">{item.label}</span>
              </button>
          ))}
      </div>
    </div>
  );
}
