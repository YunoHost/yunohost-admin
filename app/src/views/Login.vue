<template>
    <b-form @submit.prevent="login">
        <!-- TODO add hidden domain input -->
        <b-input-group>
            <template v-slot:prepend>
                <b-input-group-text>
                    <label class="sr-only" for="input-password" >{{ $t('password') }}</label>
                    <icon iname="lock" class="sm"/>
                </b-input-group-text>
            </template>
            <b-form-input required type="password" v-model="password" id="input-password" :placeholder="$t('administration_password')"></b-form-input>
            <b-input-group-append>
                <b-button type="submit" variant="success">{{ $t('login') }}</b-button>
            </b-input-group-append>
        </b-input-group>
    </b-form>
</template>

<script>
export default {
    name: 'Login',
    data: () => {
        return {
            password: ''
        }
    },
    methods: {
        login: function () {
            console.log(this.password);
        }
    }
}
</script>
