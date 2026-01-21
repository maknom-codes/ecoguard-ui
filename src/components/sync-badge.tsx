import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../db/db"
import { CheckCircle2, RefreshCw } from "lucide-react";


const SyncBadge: React.FC = () => {
    const pendingElemCount = useLiveQuery(
        () => db.dataOffline.where('status').equals('pending').count()
    );

    if (!pendingElemCount || pendingElemCount === 0) {
        return (
            <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                <CheckCircle2 size={14} />
                <span className="hidden sm:inline">À jour</span>
            </div>
        )
    }
    return (
        <div className="flex items-center gap-1.5 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-sm border border-orange-200">
            <RefreshCw size={14} className="animate-spin-slow" />
            <span>{pendingElemCount} report{pendingElemCount > 1 ? 's' : ''} with pending status</span>
        </div>
  );
}

export default SyncBadge;