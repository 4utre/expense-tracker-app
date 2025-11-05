const fs = require('fs');
const { execSync } = require('child_process');

// Database connection details
const DB_HOST = 'switchyard.proxy.rlwy.net';
const DB_PORT = '38910';
const DB_USER = 'postgres';
const DB_PASS = 'dQKHmhImRWDNmpgYnNpqHXIrLPeuuJte';
const DB_NAME = 'railway';

console.log('🔄 Starting backup transformation and import...\n');

// Read the SQL backup file
const backupContent = fs.readFileSync('backup_full_2025-11-04_15-13 copy.sql', 'utf8');

// Transform the SQL to match new schema
let transformedSql = backupContent;

// Replace column names to match Prisma schema
transformedSql = transformedSql
  .replace(/created_date/g, 'createdAt')
  .replace(/created_by/g, 'createdBy')
  .replace(/driver_name/g, 'driverName')
  .replace(/driver_number/g, 'driverNumber')
  .replace(/hourly_rate/g, 'hourlyRate')
  .replace(/overtime_rate/g, 'overtimeRate')
  .replace(/assigned_months/g, 'assignedMonths')
  .replace(/employee_name/g, 'employeeName')
  .replace(/employee_number/g, 'employeeNumber')
  .replace(/payment_date/g, 'paymentDate')
  .replace(/is_paid/g, 'isPaid')
  .replace(/type_name/g, 'typeName')
  .replace(/setting_key/g, 'settingKey')
  .replace(/setting_value/g, 'settingValue')
  .replace(/setting_category/g, 'settingCategory')
  .replace(/template_name/g, 'templateName')
  .replace(/template_type/g, 'templateType')
  .replace(/template_content/g, 'templateContent')
  .replace(/is_default/g, 'isDefault')
  .replace(/is_active/g, 'isActive')
  .replace(/expense_date/g, 'expenseDate')
  .replace(/driver_id/g, 'driverId')
  .replace(/driverName/g, 'driverName')
  .replace(/driverNumber/g, 'driverNumber')
  .replace(/expense_type/g, 'expenseType')
  .replace(/hourlyRate/g, 'hourlyRate')
  .replace(/is_overtime/g, 'isOvertime')
  .replace(/is_deleted/g, 'isDeleted');

// Save the transformed SQL
const transformedFile = 'backup_transformed.sql';
fs.writeFileSync(transformedFile, transformedSql);

console.log('✅ SQL transformation complete');
console.log('📝 Transformed file saved as:', transformedFile);
console.log('');

// Execute the transformed SQL against the database
console.log('🚀 Importing data to Railway PostgreSQL...\n');

try {
  const command = `PGPASSWORD="${DB_PASS}" psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f ${transformedFile}`;
  
  execSync(command, { 
    stdio: 'inherit',
    env: { ...process.env, PGPASSWORD: DB_PASS }
  });
  
  console.log('\n✅ Data import completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log('   - Drivers imported');
  console.log('   - Employees imported');
  console.log('   - Expense types imported');
  console.log('   - App settings imported');
  console.log('   - Print templates imported');
  console.log('   - Expenses imported');
  console.log('');
  console.log('🎉 Your backup has been restored to Railway!');
  
} catch (error) {
  console.error('❌ Error during import:', error.message);
  console.log('\nYou can try importing manually with:');
  console.log(`PGPASSWORD="${DB_PASS}" psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f ${transformedFile}`);
  process.exit(1);
}
