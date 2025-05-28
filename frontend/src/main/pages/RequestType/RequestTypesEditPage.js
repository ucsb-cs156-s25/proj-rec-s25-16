// frontend/src/main/pages/RequestType/RequestTypesEditPage.js

import React from "react";
import { useParams } from "react-router-dom";

export default function RequestTypesEditPage() {
  const { id } = useParams();

  return (
    <div data-testid="RequestTypesEditPage">
      <h1>Request Types Edit Page for id={id} (Placeholder)</h1>
    </div>
  );
}
