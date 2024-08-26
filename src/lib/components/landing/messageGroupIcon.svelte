<div class="messages">
    <div class="messageGroup">
        <div class="av">
            <img
                src="/images/avatars/Pikachu(custom).webp"
                alt="Pikachu"
            />
        </div>
        <div class="m">
            <div class="msg">
                Pika.. Pika.. Pikachu!
            </div>
        </div>
    </div>
    <div class="messageGroup me">
        <div class="av">
            <img
                src="/images/avatars/Eevee(custom).webp"
                alt="Eevee"
            />
        </div>
        <div class="m">
            <div class="msg">
                Eevee.. Eevee.. Eevee!
            </div>
            <div class="msg">
                Ee.. Evevee.. E.. Eevee!
            </div>
        </div>
    </div>
    <div class="messageGroup">
        <div class="av">
            <img
                src="/images/avatars/Charmander(custom).webp"
                alt="Charmander"
            />
        </div>
        <div class="m">
            <div class="msg">Char.. char!</div>
            <div class="msg">
                Charmander.. Charmander!
            </div>
        </div>
    </div>
</div>

<style lang="scss">
        .messages {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 30px 10px;
        width: 300px;
        max-width: 100%;
        transform: perspective(385px) rotateX(17deg) rotateY(19deg)
            rotateZ(-18deg) translateY(-27px) translateX(24px);
        filter: drop-shadow(10px 7px 31px teal);
        .messageGroup {
            display: flex;
            flex-direction: row;
            align-items: flex-end;
            gap: 2px;
            width: 100%;
            .av {
                width: 35px;
                height: 35px;
                border-radius: 50%;
                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            }
            .m {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                gap: 2px;
            }
            .msg {
                background: rgb(20, 51, 85);
                padding: 8px 10px;
                border-radius: 5px;
                border-top-right-radius: 25px;
                border-bottom-right-radius: 25px;
                font-size: 0.8rem;
                width: max-content;
                //first-child will have border-radius 25px on top-left
                &:first-child {
                    border-top-left-radius: 25px;
                }
                //last-child will have border-radius 25px on bottom-left
                &:last-child {
                    border-bottom-left-radius: 25px;
                }
            }
            &.me {
                flex-direction: row-reverse;
                .m {
                    align-items: flex-end;
                }
                .msg {
                    background: rgb(58, 112, 237);
                    border-top-right-radius: 5px;
                    border-bottom-right-radius: 5px;
                    border-top-left-radius: 25px;
                    border-bottom-left-radius: 25px;
                    &:first-child {
                        border-top-right-radius: 25px;
                    }
                    &:last-child {
                        border-bottom-right-radius: 25px;
                    }
                }
            }
        }
    }
</style>