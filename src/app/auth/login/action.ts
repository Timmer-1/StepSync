'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'


export async function login(formData: FormData) {
    // Get the cookie-aware Supabase client
    const supabase = await createClient()

    // Validate inputs
    const email = formData.get('email')
    const password = formData.get('password')


    if (!email || !password ||
        typeof email !== 'string' ||
        typeof password !== 'string') {
        throw new Error('Invalid form data')
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    })


    if (error) {
        console.error('Supabase login error:', error.message);
        return redirect(`/error?message=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/') // Revalidate and redirect upon success
    redirect('/dashboard') // Redirect to home page or dashboard after successful login
}

export async function signup(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const displayname = formData.get('displayname') as string;

    if (!email || !password || !displayname) {
        return redirect('/error?message=Missing sign up information')
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { displayname },
        },
    });

    if (error) {
        console.error('Supabase signup error:', error.message);
        return redirect(`/error?message=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/')
    redirect('/dashboard')
}