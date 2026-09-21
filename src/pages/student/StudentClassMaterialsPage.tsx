import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { LoadingIndicator } from "../../components/common/LoadingIndicator";
import { DocumentList } from "../../components/common/DocumentList";
import { classService } from "../../services/classService";
import type { ClassEntity } from "../../types/class.types";

function getErrorMessage(err: unknown, fallback: string): string {
  return isAxiosError(err)
    ? ((err.response?.data as { message?: string } | undefined)?.message ?? fallback)
    : fallback;
}

export function StudentClassMaterialsPage() {
  const { id } = useParams<{ id: string }>();
  const classId = Number(id);

  const [cls, setCls] = useState<ClassEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      const classDetail = await classService.getClassById(classId);
      setCls(classDetail);
    } catch (err) {
      setLoadError(getErrorMessage(err, "Không tải được thông tin lớp học. Vui lòng thử lại."));
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="admin-page">
        <h1>Học liệu</h1>
        <LoadingIndicator />
      </div>
    );
  }

  if (loadError || !cls) {
    return (
      <div className="admin-page">
        <h1>Học liệu</h1>
        <div className="form-error" role="alert">
          {loadError ?? "Không tìm thấy lớp học."}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <Link to="/student/classes">← Lớp học của tôi</Link>
          <h1>Học liệu — {cls.name}</h1>
        </div>
      </div>

      <section className="admin-card">
        <DocumentList classId={classId} canManage={false} />
      </section>
    </div>
  );
}
