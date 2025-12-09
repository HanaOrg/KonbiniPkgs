const g = new Bun.Glob("**/*.yaml");
for (const x of g.scanSync()) {
  const man = Bun.YAML.parse(await Bun.file(x).text()) as any;
  if (!man["categories"] || man["categories"].length == 0) {
    console.log(man.name, "is not categorized!!");
  }
}

export {};
