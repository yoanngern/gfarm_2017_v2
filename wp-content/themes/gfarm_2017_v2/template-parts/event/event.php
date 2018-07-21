<section id="content">

    <div class="platter">
        <article class="content-page gfarm_event default">

            <div class="nav">
                <a href="<?php echo get_post_type_archive_link( 'gfarm_event' ); ?>"
                   class="back"><?php pll_e( 'Back' ) ?></a>

            </div>

            <header>

                <h1><?php echo get_the_title() ?></h1>
                <time><?php echo complex_date( get_field( 'start_date' ), get_field( 'end_date' ) ); ?></time>

            </header>

            <div class="content">

				<?php the_content(); ?>


				<?php if ( get_field( 'register' ) ): ?>

                    <a class="button"
                       href="mailto:<?php echo get_field( 'register_email' ) ?>?subject=Inscription - <?php echo get_the_title() ?> - <?php echo complex_date( get_field( 'start_date' ), get_field( 'end_date' ) ); ?>"><?php pll_e( "Je m'inscris" ); ?></a>

				<?php endif; ?>

            </div>


        </article>
    </div>
</section>
