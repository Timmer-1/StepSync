'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'


export async function login(formData: FormData) {
    const supabase = await createClient() // Get the cookie-aware Supabase client

    // Validate inputs
    const email = formData.get('email')
    const password = formData.get('password')


    if (!email || !password ||
        typeof email !== 'string' ||
        typeof password !== 'string') {
        return { error: 'Invalid form data' }
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    // If there's an error (e.g. invalid password), return the error message
    if (error) {
        console.error('Supabase login error:', error.message)

        if (error.message.includes('Email not confirmed')) {
            return { error: 'email_not_confirmed' }
        }

        return { error: 'Invalid credentials' }
    }

    revalidatePath('/') // Revalidate and redirect upon success
    return { success: true }
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const displayname = formData.get('displayname') as string;

    if (!email || !password || !displayname) {
        return { error: 'Missing sign up information' }
    }

    // First check with signInWithPassword to see if account exists
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: password + '_check_exists_only' // Intentionally wrong password
    });

    // If error doesn't contain "Invalid login credentials", it may be an existing account
    if (signInError && !signInError.message.includes('Invalid login credentials')) {
        // Check if the error indicates the account exists
        if (signInError.message.includes('Email not confirmed')) {
            return { error: 'An account with this email already exists but hasn\'t been confirmed. Please check your email for the confirmation link.' }
        }
    }

    // Now attempt to sign up
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { displayname: displayname },
        },
    });

    if (error) {
        console.error('Supabase signup error:', error.message);
        // Check for various forms of duplicate email errors
        if (error.message.toLowerCase().includes('already registered') ||
            error.message.toLowerCase().includes('already exists') ||
            error.message.toLowerCase().includes('duplicate') ||
            error.message.toLowerCase().includes('user already registered')) {
            return { error: 'An account with this email already exists' }
        }

        // Critical errors that may require special handling
        if (error.status === 500 || error.message.includes('critical')) {
            return { error: `Critical error: ${error.message}` }
        }

        return { error: error.message }
    }

    // Important: Check if this is an existing account
    // Supabase may return success with identities.length = 0 for existing accounts
    if (!data.user || !data.user.id || data.user.identities?.length === 0) {
        return { error: 'An account with this email already exists' }
    }

    return { success: true, message: 'Please check your email to confirm your account' }
}