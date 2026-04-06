/**
 * Creates a config file with the correct schema and opens it in the $EDITOR application
 */
export async function template(raw_export_path: string) {
  // ensure that raw_export_path ends with .json or is an existing directory
  const export_path = raw_export_path;
  await Bun.write(
    export_path,
    `{
  "$schema": "https://superspaces.richardmch.org/schema.json",
  // Fill out your config here
}
`,
  );
}
