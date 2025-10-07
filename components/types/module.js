export const getModule = (type) => {
  switch (type) {
    case 1:
      return "Master Data";
    case 2:
      return "Inventory";
    case 3:
      return "Sales";
    case 4:
      return "Reports";
    case 5:
      return "Administrator";
    case 6:
      return "HR";
    case 7:
      return "Dashboard";
    case 8:
      return "Apparel";
    case 9:
      return "Ink Fusion";
    case 10:
      return "Finance";
    case 11:
      return "Reservation";
    case 12:
      return "Reservation Approval";
    case 13:
      return "Reservation Payments";
    case 14:
      return "Reservation Calendar";
    case 15:
      return "Production";
    case 16:
      return "Restaurant POS";
      case 17:
      return "Contact";
    default:
      return "N/A";
  }
};

