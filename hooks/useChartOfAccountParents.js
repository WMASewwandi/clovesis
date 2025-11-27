import React from "react";
import BASE_URL from "Base/api";

const useChartOfAccountParents = () => {
  const [parentAccounts, setParentAccounts] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const fetchParentAccounts = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await fetch(`${BASE_URL}/ChartOfAccount/GetAll`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch parent accounts");
        }

        const data = await response.json();
        const items = Array.isArray(data?.result) ? data.result : [];
        const formatted = items.map((account) => {
          const displayName =
            account?.name && account.name.trim().length > 0
              ? account.name.trim()
              : account?.name && account.name.trim().length > 0
              ? account.name.trim()
              : "";

          const labelParts = [
            typeof account.code === "string" ? account.code.trim() : null,
            displayName,
          ].filter((value) => value && value.length > 0);

          return {
            id: String(account.id),
            label: labelParts.join(" - ") || `Account #${account.id}`,
            raw: account,
          };
        });

        if (isMounted) {
          setParentAccounts(formatted);
        }
      } catch (error) {
        console.error("Error fetching parent accounts:", error);
        if (isMounted) {
          setParentAccounts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchParentAccounts();

    return () => {
      isMounted = false;
    };
  }, []);

  return { parentAccounts, isLoading };
};

export default useChartOfAccountParents;


