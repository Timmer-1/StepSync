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
        return redirect('/error?message=Missing sign up information')
    }

    // Let's first check if a user with this email already exists
    const { data: existingUsers } = await supabase
        .from('auth.users')
        .select('email')
        .eq('email', email)
        .single();

    if (existingUsers) {
        return { error: 'An account with this email already exists' }
    }

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
            error.message.toLowerCase().includes('duplicate')) {
            return { error: 'An account with this email already exists' }
        }

        // Critical errors that require redirect
        if (error.status === 500 || error.message.includes('critical')) {
            return redirect(`/error?message=${encodeURIComponent(error.message)}`)
        }

        return { error: error.message }
    }

    // If it's a new sign up that requires email confirmation
    if (data?.user?.identities?.length === 0) {
        return { success: true, message: 'Please check your email to confirm your account' }
    }

    return { success: true }
}