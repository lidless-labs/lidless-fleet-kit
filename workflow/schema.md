# Lidless workflow source schema

Workflow cards are generated from compact JSON so README diagrams stay readable
and repeatable.

## Shape

```json
{
  "kicker": "LIDLESS · FLEET ROUTINE",
  "title": "one kit keeps the watch consistent",
  "subtitle": "Short explanatory line.",
  "footer": "source json · generated svg",
  "lanes": [{ "id": "input", "label": "INPUT" }],
  "nodes": [
    {
      "id": "sync",
      "lane": "input",
      "row": 0,
      "title": "git pull --ff-only",
      "meta": "start clean, stay current",
      "status": "source"
    }
  ],
  "edges": [{ "from": "sync", "to": "validate" }]
}
```

## Rules

- `lanes[].id`, `nodes[].id`, `nodes[].lane`, and edge endpoints are required.
- `nodes[].row` is zero-based.
- `status` is optional. Supported values are `source`, `focus`, and `gate`.
- Keep node titles short. The renderer wraps labels, but a good workflow card is
  an operator map, not a paragraph in boxes.
- Use RFC 5737 addresses in examples if an IP is unavoidable.
- Commit both the source JSON and the generated SVG.
