import BasicLayout from "main/layouts/BasicLayout/BasicLayout";

export default function HomePage() {
  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Recommendation Request Manager</h1>
        <p>
          This is a webapp that assists students and professors in creating and
          managing recommendation letter requests.
        </p>
      </div>
    </BasicLayout>
  );
}
