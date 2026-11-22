"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { ApiError, api, clearToken, getToken, User } from "@/lib/api";

type Lead = {
  id: number;
  businessName: string;
  category: string;
  address: string;
  city: string;
  phone: string;
  website: string | null;
  rating: number | null;
  reviewCount: number | null;
  placeId: string;
  sourceUrl: string;
  score: number;
  scoreBreakdown: {
    businessTypeMatch: number;
    serviceRelevance: number;
    digitalPresence: number;
    locationFit: number;
    dataCompleteness: number;
  };
  status: "New" | "Needs Review" | "Approved" | "Rejected" | "Contacted";
  service: string;
  discoveredAt: string;
};

type SearchConfig = {
  category: string;
  location: string;
  searchTerms: string;
  targetQuantity: number;
  service: string;
};

const MOCK_LEADS: Lead[] = [
  {
    id: 1,
    businessName: "Kanpur Dental Clinic",
    category: "Dental Clinic",
    address: "123 Mall Road",
    city: "Kanpur",
    phone: "+91-512-234-5678",
    website: null,
    rating: 4.2,
    reviewCount: 87,
    placeId: "ChIJ1234567890",
    sourceUrl: "https://maps.google.com/place/1234567890",
    score: 82,
    scoreBreakdown: {
      businessTypeMatch: 30,
      serviceRelevance: 25,
      digitalPresence: 15,
      locationFit: 12,
    },
    status: "Approved",
    service: "Web Development",
    discoveredAt: "2026-11-20T10:30:00Z",
  },
  {
    id: 2,
    businessName: "Smile Care Dentistry",
    category: "Dental Clinic",
    address: "456 Civil Lines",
    city: "Kanpur",
    phone: "+91-512-345-6789",
    website: "https://smilecare.example.com",
    rating: 4.5,
    reviewCount: 156,
    placeId: "ChIJ0987654321",
    sourceUrl: "https://maps.google.com/place/0987654321",
    score: 58,
    scoreBreakdown: {
      businessTypeMatch: 30,
      serviceRelevance: 20,
      digitalPresence: 8,
      locationFit: 12,
    },
    status: "Needs Review",
    service: "Web Development",
    discoveredAt: "2026-11-20T10:35:00Z",
  },
  {
    id: 3,
    businessName: "Gupta Orthodontics",
    category: "Dental Clinic",
    address: "789 Gumti No. 5",
    city: "Kanpur",
    phone: "+91-512-456-7890",
    website: null,
    rating: 3.8,
    reviewCount: 42,
    placeId: "ChIJ1122334455",
    sourceUrl: "https://maps.google.com/place/1122334455",
    score: 75,
    scoreBreakdown: {
      businessTypeMatch: 30,
      serviceRelevance: 22,
      digitalPresence: 15,
      locationFit: 8,
    },
    status: "New",
    service: "Web Development",
    discoveredAt: "2026-11-20T10:40:00Z",
  },
  {
    id: 4,
    businessName: "Kanpur Real Estate Advisors",
    category: "Real Estate Agency",
    address: "101 The Mall",
    city: "Kanpur",
    phone: "+91-512-567-8901",
    website: "https://kanpurrealty.example.com",
    rating: 4.0,
    reviewCount: 93,
    placeId: "ChIJ2233445566",
    sourceUrl: "https://maps.google.com/place/2233445566",
    score: 68,
    scoreBreakdown: {
      businessTypeMatch: 25,
      serviceRelevance: 20,
      digitalPresence: 8,
      locationFit: 15,
    },
    status: "Approved",
    service: "SaaS Engineering",
    discoveredAt: "2026-11-20T11:00:00Z",
  },
  {
    id: 5,
    businessName: "Sharma Property Solutions",
    category: "Real Estate Agency",
    address: "202 Swaroop Nagar",
    city: "Kanpur",
    phone: "+91-512-678-9012",
    website: null,
    rating: 3.5,
    reviewCount: 28,
    placeId: "ChIJ3344556677",
    sourceUrl: "https://maps.google.com/place/3344556677",
    score: 71,
    scoreBreakdown: {
      businessTypeMatch: 25,
      serviceRelevance: 22,
      digitalPresence: 15,
      locationFit: 9,
    },
    status: "New",
    service: "SaaS Engineering",
    discoveredAt: "2026-11-20T11:05:00Z",
  },
  {
    id: 6,
    businessName: "Modern Manufacturing Co.",
    category: "Manufacturer",
    address: "303 Panki Industrial Area",
    city: "Kanpur",
    phone: "+91-512-789-0123",
    website: "https://modernmfg.example.com",
    rating: 4.1,
    reviewCount: 67,
    placeId: "ChIJ4455667788",
    sourceUrl: "https://maps.google.com/place/4455667788",
    score: 64,
    scoreBreakdown: {
      businessTypeMatch: 20,
      serviceRelevance: 25,
      digitalPresence: 8,
      locationFit: 11,
    },
    status: "Needs Review",
    service: "AI Automation",
    discoveredAt: "2026-11-20T11:30:00Z",
  },
  {
    id: 7,
    businessName: "Precision Tools Ltd",
    category: "Manufacturer",
    address: "404 Dada Nagar",
    city: "Kanpur",
    phone: "+91-512-890-1234",
    website: null,
    rating: 3.9,
    reviewCount: 34,
    placeId: "ChIJ5566778899",
    sourceUrl: "https://maps.google.com/place/5566778899",
    score: 78,
    scoreBreakdown: {
      businessTypeMatch: 20,
      serviceRelevance: 25,
      digitalPresence: 15,
      locationFit: 10,
    },
    status: "New",
    service: "AI Automation",
    discoveredAt: "2026-11-20T11:35:00Z",
  },
  {
    id: 8,
    businessName: "Tasty Bites Restaurant",
    category: "Restaurant",
    address: "505 Naveen Market",
    city: "Kanpur",
    phone: "+91-512-901-2345",
    website: null,
    rating: 4.3,
    reviewCount: 210,
    placeId: "ChIJ6677889900",
    sourceUrl: "https://maps.google.com/place/6677889900",
    score: 55,
    scoreBreakdown: {
      businessTypeMatch: 15,
      serviceRelevance: 18,
      digitalPresence: 15,
      locationFit: 7,
    },
    status: "Rejected",
    service: "Web Development",
    discoveredAt: "2026-11-20T12:00:00Z",
  },
  {
    id: 9,
    businessName: "Royal Spice Kitchen",
    category: "Restaurant",
    address: "606 Birhana Road",
    city: "Kanpur",
    phone: "+91-512-012-3456",
    website: "https://royalspice.example.com",
    rating: 4.6,
    reviewCount: 312,
    placeId: "ChIJ7788990011",
    sourceUrl: "https://maps.google.com/place/7788990011",
    score: 48,
    scoreBreakdown: {
      businessTypeMatch: 15,
      serviceRelevance: 15,
      digitalPresence: 8,
      locationFit: 10,
    },
    status: "Contacted",
    service: "Web Development",
    discoveredAt: "2026-11-20T12:05:00Z",
  },
  {
    id: 10,
    businessName: "TechStart Solutions",
    category: "SaaS Startup",
    address: "707 IT Park",
    city: "Kanpur",
    phone: "+91-512-123-4567",
    website: "https://techstart.example.com",
    rating: 4.8,
    reviewCount: 89,
    placeId: "ChIJ8899001122",
    sourceUrl: "https://maps.google.com/place/8899001122",
    score: 42,
    scoreBreakdown: {
      businessTypeMatch: 10,
      serviceRelevance: 20,
      digitalPresence: 5,
      locationFit: 7,
    },
    status: "New",
    service: "SaaS Engineering",
    discoveredAt: "2026-11-20T12:30:00Z",
  },
];

const CATEGORIES = [
  "Dental Clinic",
  "Real Estate Agency",
  "Manufacturer",
  "Restaurant",
  "SaaS Startup",
  "Law Firm",
  "Accounting Firm",
  "Marketing Agency",
  "Construction Company",
  "Healthcare Clinic",
];

const SERVICES = [
  "Web Development",
  "AI Automation",
  "SaaS Engineering",
  "Software Engineering",
  "Data Analytics",
  "Cloud/DevOps",
  "Cybersecurity",
];

const STATUSES = ["New", "Needs Review", "Approved", "Rejected", "Contacted"] as const;

const STATUS_COLORS: Record<string, string> = {
  New: "#3b82f6",
  "Needs Review": "#f59e0b",
  Approved: "#10b981",
  Rejected: "#ef4444",
  Contacted: "#8b5cf6",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getScoreColor(score: number) {
  if (score >= 70) return "#10b981";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [searchConfig, setSearchConfig] = useState<SearchConfig>({
    category: "Dental Clinic",
    location: "Kanpur",
    searchTerms: "",
    targetQuantity: 100,
    service: "Web Development",
  });
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>(MOCK_LEADS);
  const [filters, setFilters] = useState({
    status: "" as string,
    category: "" as string,
    minScore: 0,
    maxScore: 100,
    searchQuery: "",
  });
  const [sortConfig, setSortConfig] = useState<{ key: keyof Lead; direction: "asc" | "desc" }>({
    key: "score",
    direction: "desc",
  });
  const [showSearchForm, setShowSearchForm] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [stats, setStats] = useState({
    total: MOCK_LEADS.length,
    qualified: MOCK_LEADS.filter((l) => l.score >= 70).length,
    unqualified: MOCK_LEADS.filter((l) => l.score < 70).length,
    duplicates: 2,
    incomplete: MOCK_LEADS.filter((l) => !l.website).length,
  });

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    api<User>("/auth/me")
      .then(setUser)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          router.replace("/login");
        } else {
          setError(err.message);
        }
      });
  }, [router]);

  function logout() {
    clearToken();
    router.replace("/login");
  }

  useEffect(() => {
    let result = [...leads];

    if (filters.status) {
      result = result.filter((l) => l.status === filters.status);
    }
    if (filters.category) {
      result = result.filter((l) => l.category === filters.category);
    }
    if (filters.minScore > 0 || filters.maxScore < 100) {
      result = result.filter((l) => l.score >= filters.minScore && l.score <= filters.maxScore);
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.businessName.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.service.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredLeads(result);
  }, [leads, filters, sortConfig]);

  function handleSort(key: keyof Lead) {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }

  async function handleSearch() {
    setIsSearching(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSearching(false);
    setShowSearchForm(false);
  }

  function updateLeadStatus(leadId: number, newStatus: Lead["status"]) {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
  }

  function exportCSV() {
    const headers = [
      "Business Name",
      "Category",
      "Address",
      "City",
      "Phone",
      "Website",
      "Rating",
      "Review Count",
      "Place ID",
      "Source URL",
      "Score",
      "Status",
      "Service",
      "Discovered At",
    ];
    const rows = filteredLeads.map((l) => [
      l.businessName,
      l.category,
      l.address,
      l.city,
      l.phone,
      l.website || "",
      l.rating?.toString() || "",
      l.reviewCount?.toString() || "",
      l.placeId,
      l.sourceUrl,
      l.score.toString(),
      l.status,
      l.service,
      formatDate(l.discoveredAt),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leads-export-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  }

  if (error) return <main style={{ padding: 16 }}><p role="alert">{error}</p></main>;
  if (!user) return <main style={{ padding: 16 }}>Loading…</main>;

  const qualifiedCount = leads.filter((l) => l.score >= 70).length;
  const unqualifiedCount = leads.filter((l) => l.score < 70).length;

  return (
    <main style={{ padding: "16px 16px 0", fontFamily: "system-ui, sans-serif", maxWidth: "1400px", margin: "0 auto", minHeight: "100vh", background: "#f8fafc" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 16, paddingBottom: 16, borderBottom: "1px solid #e5e7eb" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, color: "#111827" }}>ETDOX Lead Intelligence</h1>
          <p style={{ margin: 4, color: "#374151" }}>Signed in as {user.name || user.email} ({user.role})</p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={() => setShowSearchForm(!showSearchForm)} style={btnStyle}>
            {showSearchForm ? "Hide Search" : "New Search"}
          </button>
          <button onClick={exportCSV} style={{ ...btnStyle, background: "#374151" }}>
            Export CSV
          </button>
          <button onClick={logout} style={{ ...btnStyle, background: "#ef4444" }}>
            Sign Out
          </button>
        </div>
      </header>

      {showSearchForm && (
        <section style={{ marginBottom: 16, padding: 20, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fafafa" }}>
          <h2 style={{ marginTop: 0, marginBottom: 16, color: "#111827" }}>New Business Search</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500, color: "#374151" }}>Business Category</label>
              <select
                value={searchConfig.category}
                onChange={(e) => setSearchConfig({ ...searchConfig, category: e.target.value })}
                style={inputStyle}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500, color: "#374151" }}>Location</label>
              <input
                type="text"
                value={searchConfig.location}
                onChange={(e) => setSearchConfig({ ...searchConfig, location: e.target.value })}
                placeholder="e.g., Kanpur, Uttar Pradesh"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500, color: "#374151" }}>Search Terms</label>
              <input
                type="text"
                value={searchConfig.searchTerms}
                onChange={(e) => setSearchConfig({ ...searchConfig, searchTerms: e.target.value })}
                placeholder="Optional keywords"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500, color: "#374151" }}>Target Quantity</label>
              <input
                type="number"
                value={searchConfig.targetQuantity}
                onChange={(e) => setSearchConfig({ ...searchConfig, targetQuantity: parseInt(e.target.value) || 0 })}
                min={1}
                max={1000}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500, color: "#374151" }}>ETDOX Service</label>
              <select
                value={searchConfig.service}
                onChange={(e) => setSearchConfig({ ...searchConfig, service: e.target.value })}
                style={inputStyle}
              >
                {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            style={{ ...btnStyle, padding: "12px 24px", fontSize: 16 }}
          >
            {isSearching ? "Searching..." : "Run Search"}
          </button>
        </section>
      )}

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ marginBottom: 16, color: "#111827" }}>Search Results Summary</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          <StatCard title="Total Discovered" value={stats.total} color="#3b82f6" />
          <StatCard title="Qualified (≥70)" value={qualifiedCount} color="#10b981" />
          <StatCard title="Unqualified (<70)" value={unqualifiedCount} color="#ef4444" />
          <StatCard title="Duplicates Found" value={stats.duplicates} color="#f59e0b" />
          <StatCard title="Incomplete Records" value={stats.incomplete} color="#8b5cf6" />
        </div>
      </section>

      <section style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Search leads..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            style={{ ...inputStyle, width: 280 }}
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            style={inputStyle}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            style={inputStyle}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>Score:</span>
            <input type="number" value={filters.minScore} onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) || 0 })} min={0} max={100} style={{ ...inputStyle, width: 80 }} placeholder="Min" />
            <span>–</span>
            <input type="number" value={filters.maxScore} onChange={(e) => setFilters({ ...filters, maxScore: parseInt(e.target.value) || 100 })} min={0} max={100} style={{ ...inputStyle, width: 80 }} placeholder="Max" />
          </div>
          <span style={{ color: "#4b5563", fontSize: 14, fontWeight: 500 }}>{filteredLeads.length} of {leads.length} leads</span>
        </div>
      </section>

      <section>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f9fafb", textAlign: "left" }}>
                {[
                  { key: "score", label: "Score" },
                  { key: "businessName", label: "Business Name" },
                  { key: "category", label: "Category" },
                  { key: "city", label: "City" },
                  { key: "phone", label: "Phone" },
                  { key: "website", label: "Website" },
                  { key: "rating", label: "Rating" },
                  { key: "status", label: "Status" },
                  { key: "service", label: "Service" },
                  { key: "discoveredAt", label: "Discovered" },
                ].map((col) => (
                  <th
                    key={col.key}
                    style={{ ...thStyle, cursor: "pointer" }}
                    onClick={() => handleSort(col.key as keyof Lead)}
                  >
                    {col.label}
                    {sortConfig.key === col.key && (sortConfig.direction === "asc" ? " ▲" : " ▼")}
                  </th>
                ))}
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: 9999,
                        fontWeight: 600,
                        color: "white",
                        background: getScoreColor(lead.score),
                        fontSize: 12,
                      }}
                    >
                      {lead.score}
                    </span>
                  </td>
                  <td style={tdStyle}><strong>{lead.businessName}</strong></td>
                  <td style={tdStyle}>{lead.category}</td>
                  <td style={tdStyle}>{lead.city}</td>
                  <td style={tdStyle}>{lead.phone}</td>
                  <td style={tdStyle}>
                    {lead.website ? (
                      <a href={lead.website} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "none" }}>
                        View
                      </a>
                    ) : (
                      <span style={{ color: "#9ca3af" }}>—</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {lead.rating ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ color: "#f59e0b" }}>★</span> {lead.rating} ({lead.reviewCount})
                      </span>
                    ) : (
                      <span style={{ color: "#9ca3af" }}>—</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 9999,
                        fontSize: 11,
                        fontWeight: 500,
                        color: "white",
                        background: STATUS_COLORS[lead.status],
                      }}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td style={tdStyle}>{lead.service}</td>
                  <td style={tdStyle}>{formatDate(lead.discoveredAt)}</td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          onClick={() => updateLeadStatus(lead.id, s)}
                          style={{
                            ...btnStyle,
                            padding: "4px 8px",
                            fontSize: 11,
                            background: lead.status === s ? STATUS_COLORS[s] : "#e5e7eb",
                            color: lead.status === s ? "white" : "#374151",
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLeads.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "#4b5563", fontWeight: 500 }}>
            No leads match your filters.
          </div>
        )}
      </section>

      <section style={{ padding: 20, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fafafa", marginBottom: 0 }}>
        <h3 style={{ marginTop: 0, color: "#111827" }}>Scoring Criteria (Configurable by Admin)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
          <CriterionRow name="Target Business-Type Match" weight={30} description="How closely the listing matches the selected business category" />
          <CriterionRow name="Potential Service Relevance" weight={25} description="How relevant the selected ETDOX service is to the business segment" />
          <CriterionRow name="Digital Presence Opportunity" weight={20} description="Observable signals such as no website listed; requires human validation" />
          <CriterionRow name="Location Fit" weight={15} description="Whether the business is inside the selected service area" />
          <CriterionRow name="Public Business Data Completeness" weight={10} description="Whether permitted core business fields are available" />
        </div>
        <p style={{ marginTop: 16, fontSize: 14, color: "#374151" }}>
          <strong>Note:</strong> Scores estimate fit with ETDOX's target profile. They are not proof that a business needs a particular service.
          Manual review is required before outreach. Weights can be adjusted by administrators.
        </p>
      </section>
    </main>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "8px 16px",
  border: "none",
  borderRadius: 6,
  background: "#3b82f6",
  color: "white",
  fontWeight: 500,
  cursor: "pointer",
  fontSize: 14,
};

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: 14,
  width: "100%",
  boxSizing: "border-box",
};

const thStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontWeight: 600,
  color: "#111827",
  borderBottom: "2px solid #e5e7eb",
  whiteSpace: "nowrap",
  userSelect: "none",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  color: "#1f2937",
  verticalAlign: "middle",
};

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div style={{ padding: 16, background: "white", border: "1px solid #e5e7eb", borderRadius: 8, borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 13, color: "#374151", marginBottom: 4, fontWeight: 500 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function CriterionRow({ name, weight, description }: { name: string; weight: number; description: string }) {
  return (
    <div style={{ padding: 12, background: "white", border: "1px solid #e5e7eb", borderRadius: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <strong style={{ fontSize: 14, color: "#111827" }}>{name}</strong>
        <span style={{ background: "#3b82f6", color: "white", padding: "2px 8px", borderRadius: 9999, fontSize: 12, fontWeight: 600 }}>
          {weight}%
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: "#4b5563" }}>{description}</p>
    </div>
  );
}