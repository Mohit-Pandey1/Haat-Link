import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/validation';
import { PageTitle } from '../../components/common/PageTitle';
import { StatCard } from '../../components/common/StatCard';

export function BuyerDashboardPage() {
  const { offers, offersLoading, requirements, requirementsLoading } = useApp();

  const isLoading = offersLoading || requirementsLoading;

  return (
    <>
      <PageTitle kicker="PROCUREMENT OVERVIEW" title="Buyer Dashboard" />

      {isLoading ? (
        <p className="intro">Loading dashboard…</p>
      ) : (
        <>
          <section className="stats">
            <StatCard
              icon="⌘"
              label="Active requirements"
              value={requirements.length}
              detail={`Across ${new Set(requirements.map((r) => r.crop)).size} crops`}
            />
            <StatCard
              icon="↗"
              label="Incoming offers"
              value={offers.length}
              detail="Awaiting review"
            />
            <StatCard
              icon="♙"
              label="Recommended farmers"
              value="8"
              detail="High quality match"
            />
            <StatCard
              icon="▣"
              label="Open orders"
              value="3"
              detail="In procurement"
            />
          </section>
          <section className="grid">
            <article className="card">
              <div className="card-title">
                <div>
                  <small>Open requirements</small>
                  <h2>Procurement progress</h2>
                </div>
                <Link className="text" to="/buyer/requirements">
                  Manage
                </Link>
              </div>
              {requirements.length === 0 ? (
                <p style={{ opacity: 0.6 }}>No active requirements.</p>
              ) : (
                requirements.map((r) => (
                  <div className="requirement" key={r._id}>
                    <span>
                      <b>{r.crop}</b>
                      <small>
                        {r.quality} · Deadline {formatDate(r.requiredBy)}
                      </small>
                    </span>
                    <strong>
                      {r.received}/{r.quantity} q
                    </strong>
                    <i>
                      <b
                        style={{ width: `${(r.received / r.quantity) * 100}%` }}
                      />
                    </i>
                  </div>
                ))
              )}
            </article>
            <article className="card">
              <small>Top recommendation</small>
              <h2>Nashik FPO</h2>
              <p>100 quintals · Grade A Onion</p>
              <strong className="big">96% match</strong>
              <button className="primary">View farmer</button>
            </article>
          </section>
        </>
      )}
    </>
  );
}
