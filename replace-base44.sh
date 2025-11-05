#!/bin/bash

# Script to replace Base44 entity calls with new API calls

cd "$(dirname "$0")"

# Replace entity list() calls with getAll()
find src/pages -name "*.jsx" -type f -exec sed -i '' \
  -e 's/base44\.entities\.Expense\.list/base44.expenses.getAll/g' \
  -e 's/base44\.entities\.Driver\.list/base44.drivers.getAll/g' \
  -e 's/base44\.entities\.Employee\.list/base44.employees.getAll/g' \
  -e 's/base44\.entities\.ExpenseType\.list/base44.expenseTypes.getAll/g' \
  -e 's/base44\.entities\.AppSetting\.list/base44.settings.getAll/g' \
  -e 's/base44\.entities\.PrintTemplate\.list/base44.printTemplates.getAll/g' \
  -e 's/base44\.entities\.User\.list/base44.users.getAll/g' \
  {} +

# Replace entity create() calls
find src/pages -name "*.jsx" -type f -exec sed -i '' \
  -e 's/base44\.entities\.Expense\.create/base44.expenses.create/g' \
  -e 's/base44\.entities\.Driver\.create/base44.drivers.create/g' \
  -e 's/base44\.entities\.Employee\.create/base44.employees.create/g' \
  -e 's/base44\.entities\.ExpenseType\.create/base44.expenseTypes.create/g' \
  -e 's/base44\.entities\.AppSetting\.create/base44.settings.set/g' \
  -e 's/base44\.entities\.PrintTemplate\.create/base44.printTemplates.create/g' \
  {} +

# Replace entity update() calls
find src/pages -name "*.jsx" -type f -exec sed -i '' \
  -e 's/base44\.entities\.Expense\.update/base44.expenses.update/g' \
  -e 's/base44\.entities\.Driver\.update/base44.drivers.update/g' \
  -e 's/base44\.entities\.Employee\.update/base44.employees.update/g' \
  -e 's/base44\.entities\.ExpenseType\.update/base44.expenseTypes.update/g' \
  -e 's/base44\.entities\.AppSetting\.update/base44.settings.set/g' \
  -e 's/base44\.entities\.PrintTemplate\.update/base44.printTemplates.update/g' \
  -e 's/base44\.entities\.User\.update/base44.users.update/g' \
  {} +

# Replace entity delete() calls  
find src/pages -name "*.jsx" -type f -exec sed -i '' \
  -e 's/base44\.entities\.Expense\.delete/base44.expenses.delete/g' \
  -e 's/base44\.entities\.Driver\.delete/base44.drivers.delete/g' \
  -e 's/base44\.entities\.Employee\.delete/base44.employees.delete/g' \
  -e 's/base44\.entities\.ExpenseType\.delete/base44.expenseTypes.delete/g' \
  -e 's/base44\.entities\.AppSetting\.delete/base44.settings.delete/g' \
  -e 's/base44\.entities\.PrintTemplate\.delete/base44.printTemplates.delete/g' \
  -e 's/base44\.entities\.User\.delete/base44.users.delete/g' \
  {} +

echo "✅ Base44 entity calls replaced!"
