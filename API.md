# REST API SPECIFICATION — GYMBruhh

Base URL: `/api`

## Authentication
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/register` | Register a new user | No |
| `POST` | `/auth/login` | Login and retrieve JWT Bearer token | No |
| `GET` | `/auth/me` | Retrieve current authenticated user profile | Yes |
| `POST` | `/auth/forgot-password` | Generate recovery token | No |

## Profile & Deterministic Engine
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/profile` | Retrieve fitness profile | Yes |
| `POST` | `/profile/onboarding` | Submit 7-step onboarding data and compute targets | Yes |
| `GET` | `/profile/targets` | Retrieve current deterministic BMI, BMR, TDEE, Calories, Macros | Yes |

## Workouts & Sessions
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/workouts/plans/active` | Retrieve active periodized workout plan | Yes |
| `GET` | `/workouts/today` | Retrieve today's scheduled workout day | Yes |
| `GET` | `/workouts/sessions` | List historical workout sessions | Yes |
| `GET` | `/workouts/sessions/active`| Get active in-progress workout session | Yes |
| `POST` | `/workouts/sessions/start` | Start a new workout session | Yes |
| `POST` | `/workouts/sessions/{id}/sets` | Log a set with weight, reps, RPE, and PR evaluation | Yes |
| `POST` | `/workouts/sessions/{id}/complete` | Finish workout and evaluate progressive overload | Yes |

## Exercise Library
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/exercises` | Search and filter exercises by muscle/equipment | No |
| `GET` | `/exercises/{id}/substitutions` | Get biomechanically similar replacements | No |

## Nutrition & Food Engine
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/nutrition/today` | Get today's consumed macros, calorie budget & meal list | Yes |
| `POST` | `/nutrition/meals` | Log a meal entry (Breakfast, Lunch, Dinner, Snack) | Yes |
| `DELETE`| `/nutrition/meals/{id}` | Remove a logged meal | Yes |
| `GET` | `/nutrition/foods/search` | Search whole foods catalog | No |
| `POST` | `/nutrition/custom-food` | Create a custom food item | Yes |
| `POST` | `/nutrition/water` | Increment water intake (+250ml) | Yes |

## Progress Analytics
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/progress/dashboard` | Get weight trajectory, volume stats, PR trophies | Yes |
| `POST` | `/progress/weight` | Log a weigh-in entry | Yes |
| `POST` | `/progress/measurements` | Log body tape measurements | Yes |
| `GET` | `/progress/prs` | Get all personal records | Yes |

## Gemini AI Integration
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/ai/workout/generate` | Generate a periodized workout split | Yes |
| `POST` | `/ai/nutrition/suggest` | Generate high-protein recipe for remaining macros | Yes |
| `POST` | `/ai/exercise/replace` | Suggest biomechanically equivalent exercise | Yes |
| `POST` | `/ai/progress/analyze` | Run weekly AI review of volume and consistency | Yes |
| `POST` | `/ai/chat` | Interactive trainer chat with memory | Yes |
| `GET` | `/ai/chat/history` | Retrieve chat message history | Yes |
| `POST` | `/ai/vision/food` | Estimate macros from meal photo | Yes |
| `GET` | `/ai/recommendations` | List pending progressive overload proposals | Yes |
| `POST` | `/ai/recommendations/respond` | Accept or reject load increase | Yes |
