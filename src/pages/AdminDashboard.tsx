import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { LogOut, Search, RefreshCw, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Submission {
  id: string;
  created_at: string;
  instagram_id: string;
  status: string;
  result_type: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  payment_status: string;
}

const PAGE_SIZE = 20;

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [resultTypeFilter, setResultTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);
  const [sortAsc, setSortAsc] = useState(false);

  // Collect unique result_types for filter dropdown
  const [resultTypes, setResultTypes] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Fetch distinct result_types once
  useEffect(() => {
    if (user && isAdmin) {
      supabase
        .from("test_submissions")
        .select("result_type")
        .not("result_type", "is", null)
        .then(({ data }) => {
          if (data) {
            const unique = [...new Set(data.map((d: any) => d.result_type as string))].sort();
            setResultTypes(unique);
          }
        });
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    let query = supabase
      .from("test_submissions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: sortAsc })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (search.trim()) {
      query = query.ilike("instagram_id", `%${search.trim()}%`);
    }
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }
    if (resultTypeFilter !== "all") {
      query = query.eq("result_type", resultTypeFilter);
    }
    if (dateFrom) {
      query = query.gte("created_at", dateFrom);
    }
    if (dateTo) {
      query = query.lte("created_at", dateTo + "T23:59:59");
    }

    const { data, error, count } = await query;
    if (error) {
      toast.error("데이터 로딩 실패");
    } else {
      setSubmissions(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin, page, sortAsc]);

  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  const toggleSort = () => {
    setSortAsc((prev) => !prev);
    setPage(0);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      success: "bg-green-500/20 text-green-400",
      processing: "bg-yellow-500/20 text-yellow-400",
      failed: "bg-destructive/20 text-destructive",
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[status] || "bg-muted text-muted-foreground"}`}>
        {status}
      </span>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">📊 Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-muted-foreground text-xs">총 테스트</p>
            <p className="text-2xl font-bold">{totalCount}</p>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-muted-foreground text-xs">현재 페이지</p>
            <p className="text-2xl font-bold">{page + 1} / {totalPages || 1}</p>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-muted-foreground text-xs">정렬</p>
            <p className="text-sm font-bold">{sortAsc ? "오래된순 ↑" : "최신순 ↓"}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs text-muted-foreground mb-1 block">Instagram ID 검색</label>
            <div className="flex gap-2">
              <Input
                placeholder="Instagram ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="bg-card border-border"
              />
              <Button variant="secondary" size="icon" onClick={handleSearch}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="min-w-[130px]">
            <label className="text-xs text-muted-foreground mb-1 block">상태</label>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
              <SelectTrigger className="bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="processing">processing</SelectItem>
                <SelectItem value="success">success</SelectItem>
                <SelectItem value="failed">failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[160px]">
            <label className="text-xs text-muted-foreground mb-1 block">결과 유형</label>
            <Select value={resultTypeFilter} onValueChange={(v) => { setResultTypeFilter(v); setPage(0); }}>
              <SelectTrigger className="bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {resultTypes.map((rt) => (
                  <SelectItem key={rt} value={rt}>{rt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">시작일</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-card border-border w-[140px]"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">종료일</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-card border-border w-[140px]"
            />
          </div>
          <Button variant="secondary" onClick={handleSearch}>
            <RefreshCw className="w-4 h-4 mr-1" /> 조회
          </Button>
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>
                  <button onClick={toggleSort} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    일시 <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead>Instagram ID</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>결과 유형</TableHead>
                <TableHead className="hidden md:table-cell">디바이스</TableHead>
                <TableHead className="hidden md:table-cell">브라우저</TableHead>
                <TableHead className="hidden lg:table-cell">OS</TableHead>
                <TableHead>결제</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    로딩 중...
                  </TableCell>
                </TableRow>
              ) : submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    데이터 없음
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((s) => (
                  <TableRow key={s.id} className="border-border">
                    <TableCell className="text-xs whitespace-nowrap">
                      {format(new Date(s.created_at), "MM/dd HH:mm")}
                    </TableCell>
                    <TableCell className="font-medium">@{s.instagram_id}</TableCell>
                    <TableCell>{statusBadge(s.status)}</TableCell>
                    <TableCell className="text-xs">{s.result_type || "-"}</TableCell>
                    <TableCell className="text-xs hidden md:table-cell">{s.device_type || "-"}</TableCell>
                    <TableCell className="text-xs hidden md:table-cell">{s.browser || "-"}</TableCell>
                    <TableCell className="text-xs hidden lg:table-cell">{s.os || "-"}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        s.payment_status === "paid"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {s.payment_status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="flex items-center text-sm text-muted-foreground px-3">
            {page + 1} / {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
