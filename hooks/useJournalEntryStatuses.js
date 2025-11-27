import React from "react";
import BASE_URL from "Base/api";

const useJournalEntryStatuses = () => {
  const [statuses, setStatuses] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const fetchStatuses = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await fetch(`${BASE_URL}/EnumLookup/JournalEntryStatuses`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch journal entry statuses");
        }

        const data = await response.json();
        const options = data?.result
          ? Object.entries(data.result).map(([value, label]) => ({
              value,
              label,
            }))
          : [];

        if (isMounted) {
          setStatuses(options);
        }
      } catch (error) {
        console.error("Error fetching journal entry statuses:", error);
        // Fallback to hardcoded statuses if API fails
        if (isMounted) {
          setStatuses([
            { value: "1", label: "Draft" },
            { value: "2", label: "Approved" },
            { value: "3", label: "Rejected" },
          ]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchStatuses();

    return () => {
      isMounted = false;
    };
  }, []);

  return { statuses, isLoading };
};

export default useJournalEntryStatuses;

