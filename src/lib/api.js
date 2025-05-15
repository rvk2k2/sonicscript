export async function getUserCredits(idToken) {
    const res = await fetch("/api/credits", {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
  
    if (!res.ok) throw new Error("Failed to fetch credits");
  
    const data = await res.json();
    return data.totalCredits;
  }