"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { getTrafficReport } from "@/lib/traffic";
import { Trend } from "./trend";
import { DailyTable, ReportNav, ReportValue } from "./report-parts";

export function Report({
  days,
  data,
  locale,
  t,
}: {
  days: 7 | 30;
  data: ReturnType<typeof getTrafficReport>;
  locale: "ko" | "en";
  t: typeof import("@/locales/en/dashboard.json");
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [period, selectPeriod] = useOptimistic(days);
  const report = days === period ? data : undefined;
  const number = new Intl.NumberFormat([locale, "en"]);
  const percent = new Intl.NumberFormat([locale, "en"], { style: "percent", maximumFractionDigits: 1 });
  const shortDate = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" });
  const rangeDate = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });
  function dateLabel(isoDate: string, withYear = false) {
    if (locale === "en") return (withYear ? rangeDate : shortDate).format(new Date(isoDate));
    // Small-ICU Node builds have no Korean month names.
    const [year, month, day] = isoDate.split("-").map(Number);
    return withYear ? `${year}. ${month}. ${day}.` : `${month}월 ${day}일`;
  }
  const devices = [
    { key: "mobile", name: t.mobile, color: "var(--primary)" },
    { key: "desktop", name: t.desktop, color: "var(--input)" },
  ] as const;
  const mobileShare = report ? (100 * report.mobile) / report.total : 0;

  return (
    <section className="traffic-report" aria-labelledby="report-title">
      <ReportNav label={t.navigation} overview={t.overview} charts={t.charts} daily={t.daily} />
      <div className="report-content">
        <div id="overview" tabIndex={-1} className="traffic-intro">
          <div>
            <h2 id="report-title">{t.title}</h2>
            <div className="traffic-dateline">
              <span className="traffic-sample">{t.sample}</span>
              <span>
                <ReportValue>
                  {report &&
                    `${dateLabel(report.daily[0].date, true)} – ${dateLabel(report.daily[report.daily.length - 1].date, true)}`}
                </ReportValue>
              </span>
            </div>
          </div>
          <form
            action="/dashboard"
            method="get"
            aria-labelledby="period-title"
            onSubmit={(event) => {
              event.preventDefault();
              const button = (event.nativeEvent as SubmitEvent).submitter;
              const value = button?.getAttribute("value") === "30" ? 30 : 7;
              if (value === period) return;
              startTransition(() => {
                selectPeriod(value);
                router.push(`/dashboard?days=${value}`, { scroll: false });
              });
            }}
          >
            <span id="period-title" className="report-filter-label">
              {t.period}
            </span>
            <div className="traffic-period">
              {[7, 30].map((value) => (
                <Button key={value} variant="ghost" type="submit" name="days" value={value} aria-pressed={period === value}>
                  {t.days.replace("{{count}}", String(value))}
                </Button>
              ))}
            </div>
          </form>
        </div>

        {!report && (
          <p className="sr-only" role="status">
            {t.loading}
          </p>
        )}
        <dl className="traffic-metrics" aria-busy={!report}>
          <div>
            <dt>{t.total}</dt>
            <dd>
              <ReportValue>{report && number.format(report.total)}</ReportValue>
            </dd>
          </div>
          <div>
            <dt>{t.average}</dt>
            <dd>
              <ReportValue>{report && number.format(report.average)}</ReportValue>
            </dd>
          </div>
          <div>
            <dt>{t.peak}</dt>
            <dd>
              <ReportValue>{report && number.format(report.peak.visits)}</ReportValue>{" "}
              <small>
                <ReportValue>{report && dateLabel(report.peak.date)}</ReportValue>
              </small>
            </dd>
          </div>
        </dl>

        <div id="charts" tabIndex={-1} className="traffic-charts" aria-busy={!report}>
          <section className="traffic-panel">
            <h2 id="trend-title">{t.trend}</h2>
            <p className="traffic-description">{t.trendHint}</p>
            {report ? (
              <Trend
                daily={report.daily.map((row) => ({ label: dateLabel(row.date), visits: row.visits }))}
                peak={report.peak.visits}
                number={number}
                visitsLabel={t.visits}
              />
            ) : (
              <div className="traffic-trend report-trend-skeleton" aria-hidden="true" />
            )}
          </section>
          <section className="traffic-panel">
            <h2 id="devices-title">{t.devices}</h2>
            <div className="traffic-ring">
              {report ? (
                <svg
                  className="traffic-donut"
                  viewBox="0 0 172 172"
                  role="img"
                  aria-labelledby="devices-title"
                  aria-describedby="device-values"
                >
                  <g transform="rotate(-90 86 86)" fill="none" strokeWidth="14">
                    <circle
                      cx="86"
                      cy="86"
                      r="69.5"
                      pathLength="100"
                      stroke="var(--primary)"
                      strokeDasharray={`${mobileShare - 0.6} 100`}
                    />
                    <circle
                      cx="86"
                      cy="86"
                      r="69.5"
                      pathLength="100"
                      stroke="var(--input)"
                      strokeDasharray={`${100 - mobileShare - 0.6} 100`}
                      strokeDashoffset={-mobileShare}
                    />
                  </g>
                </svg>
              ) : (
                <div className="traffic-donut report-ring-skeleton" aria-hidden="true" />
              )}
              <div className="traffic-ring-label" aria-hidden="true">
                <strong>
                  <ReportValue>{report && percent.format(report.mobile / report.total)}</ReportValue>
                </strong>
                <span>{t.mobile}</span>
              </div>
            </div>
            <dl id="device-values" className="traffic-devices">
              {devices.map(({ key, name, color }) => (
                <div key={key}>
                  <dt>
                    <i aria-hidden="true" style={{ background: color }} />
                    {name}
                  </dt>
                  <dd>
                    <ReportValue>{report && number.format(report[key])}</ReportValue>{" "}
                    <span>
                      <ReportValue>{report && percent.format(report[key] / report.total)}</ReportValue>
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
        <DailyTable
          title={t.daily}
          columns={[t.date, t.mobile, t.desktop, t.visits]}
          daily={report?.daily}
          days={period}
          formatDate={dateLabel}
          number={number}
        />
      </div>
    </section>
  );
}
