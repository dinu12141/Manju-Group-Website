const fs = require('fs');

const path = 'client/src/pages/Admin.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Inject TRPC hooks
const target1 = '  // Reviews query can also surface an expired/invalid admin session.';
const replacement1 =   // Inquiries Hooks
  const [inquiryPage, setInquiryPage] = useState(1);
  const {
    data: inquiriesData,
    isLoading: isInquiriesLoading,
    refetch: refetchInquiries,
  } = trpc.admin.inquiriesList.useQuery(
    { page: inquiryPage, limit: 20 },
    { enabled: isAdmin }
  );
  const inquiriesList = inquiriesData?.items || [];
  const unreadInquiriesCount = inquiriesList.filter(i => !i.isRead).length;

  const markInquiryReadMutation = trpc.admin.markInquiryRead.useMutation({
    onSuccess: () => refetchInquiries(),
  });
  const deleteInquiryMutation = trpc.admin.deleteInquiry.useMutation({
    onSuccess: () => refetchInquiries(),
  });

  // Reviews query can also surface an expired/invalid admin session.;
content = content.replace(target1, replacement1);

// 2. Fix the badge count
const target2 =                 {
                  id: "inquiries",
                  label: "Inquiries & Leads CRM",
                  icon: Mail,
                  badge: INQUIRIES_DATA.length,
                },;
const replacement2 =                 {
                  id: "inquiries",
                  label: "Inquiries & Leads CRM",
                  icon: Mail,
                  badge: unreadInquiriesCount || undefined,
                },;
content = content.replace(target2, replacement2);

// 3. Replace the inquiries mapping
const target3Start = '{INQUIRIES_DATA.map(inq => (';
const target3End =                       </a>
                    </div>
                  </div>
                ))};

const startIdx = content.indexOf(target3Start);
const endIdx = content.indexOf(target3End) + target3End.length;

if (startIdx === -1 || endIdx === -1) {
    console.error('Target 3 bounds not found!');
    process.exit(1);
}

const replacement3 = {inquiriesList.length === 0 && !isInquiriesLoading && (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                    <p className="text-sm font-bold text-slate-400">No inquiries found.</p>
                  </div>
                )}
                {inquiriesList.map(inq => {
                  const subjectText = inq.subject || "";
                  const match = subjectText.match(/^\\[(.*?)\\] (.*)$/);
                  const department = match ? match[1] : "General Inquiry";
                  const cleanSubject = match ? match[2] : subjectText;
                  
                  return (
                  <div
                    key={inq.id}
                    className={\g-white p-5 rounded-2xl border shadow-sm space-y-2 transition-all \\}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{inq.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">{department}</span>
                        {!inq.isRead && <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black animate-pulse">New</span>}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{new Date(inq.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="text-xs font-bold text-slate-800">{cleanSubject}</div>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">{inq.message}</p>

                    <div className="pt-2 flex items-center justify-between">
                      <div className="text-xs text-slate-500 font-medium">
                        Contact: <span className="font-bold text-slate-800">{inq.phone || "N/A"}</span> ({inq.email})
                      </div>
                      <div className="flex items-center gap-2">
                        {!inq.isRead && (
                          <button onClick={() => markInquiryReadMutation.mutate({ id: inq.id })} disabled={markInquiryReadMutation.isPending} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 transition-colors">
                            <Check size={12} /><span>Mark as Read</span>
                          </button>
                        )}
                        {inq.phone && (
                          <a href={\https://wa.me/94\\} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1 transition-colors">
                            <Phone size={12} /><span>Reply</span>
                          </a>
                        )}
                        <button onClick={() => { if (confirm("Delete?")) deleteInquiryMutation.mutate({ id: inq.id }); }} disabled={deleteInquiryMutation.isPending} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )})};

content = content.slice(0, startIdx) + replacement3 + content.slice(endIdx);

fs.writeFileSync(path, content, 'utf8');
console.log('Admin.tsx updated successfully');
