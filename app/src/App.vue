<template>
    <div id="app">
        <header>
            <b-navbar>
                <b-navbar-brand to="/" exact exact-active-class="active"><img alt="Yunohost logo" src="./assets/logo.png"></b-navbar-brand>
                <b-navbar-nav class="ml-auto">
                    <li class="nav-item">
                        <b-button href="/yunohost/sso" variant="primary" block size="sm">{{ $t('user_interface_link') }}</b-button>
                    </li>
                    <li class="nav-item">
                        <b-button to="/logout" variant="outline-dark" block size="sm">{{ $t('logout') }}</b-button>
                    </li>
                </b-navbar-nav>
            </b-navbar>
        </header>

        <main>
            <router-view/>
        </main>

        <footer>
            <nav>
                <b-nav>
                    <b-nav-item href="https://yunohost.org/docs" target="_blank" link-classes='text-secondary'>Documentation</b-nav-item>
                    <b-nav-item href="https://yunohost.org/help" target="_blank" link-classes='text-secondary'>Need help?</b-nav-item>
                    <b-nav-item href="https://donate.yunohost.org/" target="_blank" link-classes='text-secondary'>Donate</b-nav-item>
                    <b-nav-text class="ml-auto" id="yunohost-version">version</b-nav-text>
                </b-nav>
            </nav>
        </footer>
    </div>
</template>

<style lang="scss">
@import '@/scss/main.scss';

header {
    border-bottom: 1px solid #eee;
    margin-top: 1rem;
    margin-bottom: 2rem;

    .navbar {
        padding: 1rem;

        img {
            width: 70px;
        }

        .navbar-nav {
            flex-direction: column;

            li {
                margin: .2rem 0;
            }
        }
    }
}

footer {
    padding: 1rem 0;
    border-top: 1px solid #eee;
    font-size: 0.875rem;
    margin-top: 2rem;

    li {
        &:not(:first-child) a::before {
            content: "•";
            width: 1rem;
            display: inline-block;
            margin-left: -1rem;
        }
        &:first-child {
            margin-left: -1rem;
        }
    }
}
</style>
