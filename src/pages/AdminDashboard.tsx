import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { LogOut, Search, Calendar, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Submission {
  id: string;
  created_at: string;
  instagram_id: string;
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
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchData = async () => {
    setLoading(true);
    let query = supabase
      .from("test_submissions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (search.trim()) {
      query = query.ilike("instagram_id", `%${search.trim()}%`);
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
  }, [user, isAdmin, page]);

  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[200px]">
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
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">시작일</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-card border-border w-[160px]"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">종료일</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-card border-border w-[160px]"
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
                <TableHead>일시</TableHead>
                <TableHead>Instagram ID</TableHead>
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
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    로딩 중...
                  </TableCell>
                </TableRow>
              ) : submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
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
