<?php

namespace Proservia\CoreBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\TextType;

/**
 * Class ContactType
 * @package Proservia\CoreBundle\Form
 */
class ContactType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('id', HiddenType::class, array(
                'label' => 'id',
            ))
            ->add('name', TextType::class, array(
                'label' => 'Nom',
                'label_attr' => array(
                    'class' => 'col-sm-3 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'Saisir un nom',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('surname', TextType::class, array(
                'label' => 'Prénom',
                'label_attr' => array(
                    'class' => 'col-sm-3 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'Saisir un prénom',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('mail', TextType::class, array(
                'label' => 'Mail',
                'label_attr' => array(
                    'class' => 'col-sm-3 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'Saisir un email',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('fixePhone', TextType::class, array(
                'label' => 'Téléphone Fixe',
                'label_attr' => array(
                    'class' => 'col-sm-3 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'Saisir un numéro Fixe',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('mobilePhone', TextType::class, array(
                'label' => 'Téléphone Mobile',
                'label_attr' => array(
                    'class' => 'col-sm-3 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'Saisir un numero Mobile',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))

        ;
    }
    
    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Proservia\CoreBundle\Entity\Contact'
        ));
    }
}
