import React from 'react'
import LoginForm from '../../components/LoginForm'
import styles from './page.module.css'

export default function LoginPage(){
  return (
    <main className={styles.page}>

      <section className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Agent Management</h1>
          <p className={styles.lead}>Create agents, upload lists and distribute tasks reliably.</p>

          <ul className={styles.features}>
            <li>Quick agent creation</li>
            <li>CSV/XLSX upload & distribution</li>
            <li>Role-based dashboards</li>
          </ul>
        </div>

        <aside className={styles.card}>
          <h2>Sign in</h2>
          <p className={styles.sub}>Enter credentials to continue. The API will determine your role.</p>
          <LoginForm />
        </aside>
      </section>
    </main>
  )
}
