"use client"

import React from 'react'
import styles from './AgentProfile.module.css'

export default function AgentProfile({ user }: { user: any }) {
    return (
        <aside className={styles.panel}>
            <div className={styles.top}>
                <div className={styles.avatar}>{(user?.name || user?.email || 'A').slice(0, 1).toUpperCase()}</div>
                <div>
                    <div className={styles.name}>{user?.name || user?.email}</div>
                    <div className={styles.meta}>{user?.email}</div>
                </div>
            </div>
            <div className={styles.section}>
                <div className={styles.label}>User Id</div>
                <code>{user?.id}</code>
            </div>
            <div className={styles.section}>
                <div className={styles.label}>Role</div>
                <div className={styles.value}>{user?.role || 'agent'}</div>
            </div>
            {(
                <div className={styles.section}>
                    <div className={styles.label}>Mobile</div>
                    <div className={styles.value}>{user.mobile || 'NaN'}</div>
                </div>
            )}
            {(
                <div className={styles.section}>
                    <div className={styles.label}>Joined</div>
                    <div className={styles.value}>{new Date(user.createdAt || Date.now()).toLocaleDateString()}</div>
                </div>
            )}
        </aside>
    )
}
