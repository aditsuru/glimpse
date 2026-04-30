## For route that return just a boolean or doesn't return any data

Must always be an object.

| Case                     | Return                             |
| ------------------------ | ---------------------------------- |
| Boolean check            | `{ [relevantAdjective]: boolean }` |
| Fire-and-forget mutation | `{ success: true }`                |

`available` over `isAvailable` — the `is` prefix is redundant when it's already a boolean in a typed system.
