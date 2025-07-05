// Replace the formatDate function with this native JS version
export const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    // Month names
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    // Format time to 12-hour with AM/PM
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${
      months[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()} - ${hours}:${minutes} ${ampm}`;
  };