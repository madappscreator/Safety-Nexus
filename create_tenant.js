// create_tenant.js
const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccount = require("../safety-nexus-d6aab-firebase-adminsdk-fbsvc-2fe0734aea.json");

// Initialize admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${serviceAccount.project_id}.appspot.com`
});

// Use the "production" database
const db = admin.firestore();
db.settings({ databaseId: "production" });
const auth = admin.auth();

async function createTenant({ companyId, name, code, plan='starter', expiryDays=365, userLimit=50 }) {
  const expiryDate = admin.firestore.Timestamp.fromDate(new Date(Date.now() + expiryDays*24*3600*1000));
  const companyRef = db.collection('companies').doc(companyId);
  await companyRef.set({
    name,
    code,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    isActive: true,
    subscription: { plan, expiryDate, userLimit }
  });
  console.log(`Created company ${companyId}`);
}

async function createUser({ email, password, displayName, companyId, role }) {
  let userRecord;

  try {
    // Try to get existing user
    userRecord = await auth.getUserByEmail(email);
    console.log(`User ${email} already exists (uid: ${userRecord.uid})`);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      // Create new user
      userRecord = await auth.createUser({
        email,
        password,
        displayName,
        emailVerified: true
      });
      console.log(`Created new auth user ${email} (uid: ${userRecord.uid})`);
    } else {
      throw err;
    }
  }

  // Set custom claims
  await auth.setCustomUserClaims(userRecord.uid, { companyId, role });

  // Create/update global user doc
  await db.collection('users').doc(userRecord.uid).set({
    uid: userRecord.uid,
    email,
    displayName,
    companyId,
    role,
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  console.log(`User doc created/updated: ${email} role:${role} company:${companyId}`);
  return userRecord;
}

// Example usage (main)
(async () => {
  try {
    // Main tenant (platform admin)
    await createTenant({ companyId: 'safetynexus', name: 'SafetyNexus Platform', code: 'SAFENEXUS', plan: 'internal', expiryDays: 3650, userLimit: 9999 });

    const platformAdmin = await createUser({ email: 'admin@safety-nexus.com', password: 'Admin@2025@3241', displayName: 'SafetyNexus Admin', companyId: 'safetynexus', role: 'platform_admin' });

    // Demo tenant
    await createTenant({ companyId: 'demo_company', name: 'Demo Industries', code: 'DEMO-001', plan: 'starter', expiryDays: 30, userLimit: 50 });
    const demoAdmin = await createUser({ email: 'admin@demoindustry.com', password: 'Admin@2025', displayName: 'Demo Company Admin', companyId: 'demo_company', role: 'company_admin' });

    // Create supervisor for demo_company (needed for permit approval workflow)
    await createUser({ email: 'supervisor@demoindustry.com', password: 'Supervisor@123', displayName: 'Demo Supervisor', companyId: 'demo_company', role: 'supervisor' });

    // Create HSE Manager for demo_company (needed for final approval)
    await createUser({ email: 'hse@demoindustry.com', password: 'HSE@123', displayName: 'Demo HSE Manager', companyId: 'demo_company', role: 'hse_manager' });

    // Create Shift Incharge for demo_company (needed for stage 2 approval)
    await createUser({ email: 'shift@demoindustry.com', password: 'Shift@123', displayName: 'Demo Shift Incharge', companyId: 'demo_company', role: 'shift_incharge' });

    // create workers under demo_company
    for (let i=1; i<=3; i++) {
      const email = `worker${i}@demoindustry.com`;
      await createUser({ email, password: 'Worker@123', displayName: `Demo Worker ${i}`, companyId: 'demo_company', role: 'worker' });
    }

    // create employees under demo_company
    for (let i=1; i<=2; i++) {
      const email = `employee${i}@demoindustry.com`;
      await createUser({ email, password: 'Employee@123', displayName: `Demo Employee ${i}`, companyId: 'demo_company', role: 'employee' });
    }

    console.log('Done creating tenants & users');
    process.exit(0);
  } catch (err) {
    console.error('Error', err);
    process.exit(1);
  }
})();
