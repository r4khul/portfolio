import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.GITHUB_PAT;
  const username = "r4khul";
  const year = new Date().getFullYear();

  if (!token) {
    return NextResponse.json({ error: "Missing GITHUB_PAT token" }, { status: 500 });
  }

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          username,
        },
      }),
      next: { revalidate: 3600 }, // Cache on server for 1 hour
    });

    const result = await response.json();
    
    if (result.errors) {
      console.error('GitHub GraphQL errors:', result.errors);
      return NextResponse.json({ error: result.errors[0]?.message || 'GraphQL error' }, { status: 500 });
    }

    const calendar = result.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) {
      return NextResponse.json({ error: "No contribution data found" }, { status: 404 });
    }

    const contributions = calendar.weeks.flatMap((w: any) =>
      w.contributionDays.map((d: any) => ({
        date: d.date,
        count: d.contributionCount,
      }))
    );

    return NextResponse.json({
      contributions,
      totalContributions: calendar.totalContributions,
    });
  } catch (error) {
    console.error('Failed to fetch from GitHub API:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
