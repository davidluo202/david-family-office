export async function fetchZestimate(address: string): Promise<{
  zestimate: number | null;
  rentZestimate: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  livingArea: number | null;
  yearBuilt: number | null;
  error?: string;
}> {
  const empty = { zestimate: null, rentZestimate: null, bedrooms: null, bathrooms: null, livingArea: null, yearBuilt: null };
  try {
    const apiKey = localStorage.getItem('mfo_rapidapi_key');
    if (!apiKey) {
      return { ...empty, error: 'Please set RapidAPI key in Settings' };
    }

    const resp = await fetch(
      `https://zillow-com1.p.rapidapi.com/propertyExtendedSearch?location=${encodeURIComponent(address)}&home_type=Houses`,
      {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com',
        },
      }
    );

    if (!resp.ok) throw new Error(`API error: ${resp.status}`);
    const data = await resp.json();

    if (data.props && data.props.length > 0) {
      const prop = data.props[0];
      return {
        zestimate: prop.zestimate || prop.price || null,
        rentZestimate: prop.rentZestimate || null,
        bedrooms: prop.bedrooms || null,
        bathrooms: prop.bathrooms || null,
        livingArea: prop.livingArea || null,
        yearBuilt: prop.yearBuilt || null,
      };
    }
    return { ...empty, error: 'No property found' };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return { ...empty, error: msg };
  }
}
